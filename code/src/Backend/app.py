from flask import Flask, request, jsonify
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.llms.huggingface_api import HuggingFaceInferenceAPI
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from typing import List, Dict
from huggingface_hub import InferenceClient
from werkzeug.utils import secure_filename
from threading import Lock
import sqlite3
import json
import re
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx', 'txt'}

# Configuration
CONFIG = {
    "documents_dir": "uploads",
    "rules_db": "rules.db",
    "flagged_items_db": "flagged_items.db",
    # Get your free API key from Hugging Face
    "hf_api_key": os.getenv("HF_API_KEY"),
    "llm_model": "mistralai/Mistral-7B-Instruct-v0.1",  # Free inference API model
    "embedding_model": "sentence-transformers/all-mpnet-base-v2",
    "max_tokens": 2000  # Stay within free tier limits
}
print(CONFIG["hf_api_key"])
# Initialize services
client = InferenceClient(token=CONFIG["hf_api_key"])

# Configure global settings instead of ServiceContext
Settings.llm = HuggingFaceInferenceAPI(
    model_name=CONFIG["llm_model"],
    token=CONFIG["hf_api_key"]
)
Settings.embed_model = HuggingFaceEmbedding(
    model_name=CONFIG["embedding_model"]
)
Settings.chunk_size = 512
Settings.chunk_overlap = 20

db_lock = Lock()


class DocumentProcessor:
    def __init__(self):
        self.index = Lock()
        print("__init__ called")
        self._init_db()

    def _init_db(self):
        print("_init_db called")
        with db_lock:
            conn = sqlite3.connect(CONFIG["rules_db"])
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rule_name TEXT,
                rule_description TEXT,
                rule_condition TEXT,
                error_message TEXT,
                source_document TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            conn.commit()
            conn.close()

    def process_uploaded_files(self, filepaths: List[str]):
        print("process_uploaded_files called")

        self.index = None
        if not os.path.exists(CONFIG["documents_dir"]):
            os.makedirs(CONFIG["documents_dir"])
        # for file_path in file_paths:
        #     if os.path.isfile(file_path):
        #         os.system(f"cp {file_path} {CONFIG['documents_dir']}")
        try:
            documents = SimpleDirectoryReader(
                CONFIG["documents_dir"]).load_data()
            self.index = VectorStoreIndex.from_documents(
                documents, show_progress=True)
            print(self.index)
            return True, f"Processed {len(documents)} documents"
        except Exception as e:
            return False, str(e)

    def extract_rules(self, query: str):
        print(self.index)
        print("extract_rules called")
        """Extract rules from documents using LLM with better prompting"""
        if not self.index:
            print("self.index error")
            return False, "Please load documents first"

        # Improved prompt with strict JSON formatting instructions
        prompt = f"""
        You are a regulatory compliance expert analyzing financial documents.
        Extract all neccessary data validation rules from given context in this SPECIFIC JSON format:
        
        {{
        "rules": [
            {{
            "rule_name": "exact_rule_name",
            "rule_description": "detailed_description",
            "rule_condition": "validation_logic",
            "error_message": "template message"
            }},
            // 4 more rules in same format
        ]
        }}

        Rules should cover:
        - Data type validations
        - Value range checks
        - Cross-field relationships
        - Format requirements
        - Business logic constraints

        Context: {query}

        Respond ONLY with valid JSON. No additional text or explanations.
        """

        try:
            response = client.text_generation(
                prompt,
                max_new_tokens=CONFIG["max_tokens"],
                temperature=0.3
            )

            # Improved JSON parsing with validation
            response = response.strip()
            # print(response)
            if response.startswith("```json"):
                response = response[7:-3].strip()
            if response.endswith("```"):
                response = response[:-3].strip()
            print(response)
            parsed = json.loads(response)
            print(parsed["rules"])
            # Validate structure
            if "rules" not in parsed:
                raise ValueError("Missing 'rules' array")

            for rule in parsed["rules"]:
                if not all(k in rule for k in ["rule_name", "rule_description", "rule_condition", "error_message"]):
                    raise ValueError("Missing required rule fields")

            self._store_rules(parsed["rules"])
            return True, parsed

        except Exception as e:
            print("Exception called")
            return False, str({
                "error": f"Failed to parse rules: {str(e)}",
                "raw_response": response,
                "suggestion": "Try rephrasing your query to be more specific about rule types needed."
            })

    def _fix_json(self, json_str: str):
        print("_fix_json called")
        """Attempt to fix malformed JSON from LLM"""
        json_str = re.sub(
            r'(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'', json_str)
        json_str = json_str[json_str.find('['):json_str.rfind(']')+1]
        return json_str

    def _store_rules(self, rules: List[Dict]):
        print("_store_rules called")
        """Store extracted rules with validation"""
        with db_lock:
            conn = sqlite3.connect(CONFIG["rules_db"])
            cursor = conn.cursor()
            for rule in rules:
                try:
                    cursor.execute(
                        "INSERT INTO rules (rule_name, rule_description, rule_condition, error_message, source_document) VALUES (?, ?, ?, ?, ?)",
                        (rule["rule_name"][:100],
                         rule["rule_description"][:500],
                         rule["rule_condition"][:500],
                         rule["error_message"][:200],
                         str(self.index))
                    )
                except sqlite3.Error as e:
                    print(f"Database error: {e}")
            conn.commit()
            conn.close()


def allowed_file(filename):
    print("allowed_file called")
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower(
           ) in app.config['ALLOWED_EXTENSIONS']


@app.route('/api/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    files = request.files.getlist('files')
    saved_paths = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(save_path)
            saved_paths.append(save_path)
    success, message = DocumentProcessor().process_uploaded_files(saved_paths)
    return jsonify({"success": success, "message": message})


@app.route('/api/extract-rules', methods=['POST'])
def extract_rules_api():
    data = request.json
    query = data.get('query', '')
    # DocumentProcessor().extract_rules(query)
    success, result = DocumentProcessor().extract_rules(query)
    if success:
        return jsonify({"rules": result})
    else:
        return jsonify({"error": result}), 500


@app.route('/api', methods=['GET'])
def home():
    return "home success"


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)
