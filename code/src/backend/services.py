import sqlite3
from huggingface_hub import InferenceClient
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.llms.huggingface_api import HuggingFaceInferenceAPI
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from typing import List, Dict
import re
import os
import json
from threading import Lock
import shutil
from dotenv import load_dotenv

load_dotenv()
# Configuration (same as original)
CONFIG = {
    "documents_dir": "parsed_docs",
    "rules_db": "rules.db",
    "validation_functions_db": "validation_functions.db",
    "uploads": "uploads.db",
    "flagged_items_db": "flagged_items.db",
    "hf_api_key": os.getenv("HF_API_KEY"),
    "llm_model": "mistralai/Mistral-7B-Instruct-v0.1",
    "embedding_model": "sentence-transformers/all-mpnet-base-v2",
    "max_tokens": 2000
}

client = InferenceClient(token=CONFIG["hf_api_key"])
db_lock = Lock()
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


class DocumentProcessor:
    def __init__(self):
        print("__init__ called")

    def process_uploaded_files(self, filepaths: List[str]):
        print("process_uploaded_files called")

        try:

            if os.path.exists(CONFIG["documents_dir"]):
                for f in os.listdir(CONFIG["documents_dir"]):
                    os.remove(os.path.join(CONFIG["documents_dir"], f))
            else:
                os.makedirs(CONFIG["documents_dir"])
            index = None
            fileName = None
            # 2. Copy new files to working directory
            for filepath in filepaths:
                if os.path.isfile(filepath):
                    fileName = os.path.basename(filepath)
                    shutil.copy2(filepath, CONFIG["documents_dir"])
                else:
                    print(f"Warning: File not found - {filepath}")
            documents = SimpleDirectoryReader(
                CONFIG["documents_dir"]).load_data()
            index = VectorStoreIndex.from_documents(
                documents,
                show_progress=True
            )
            with db_lock:
                conn = sqlite3.connect(CONFIG["uploads"])
                cursor = conn.cursor()
                try:
                    cursor.execute(
                        "INSERT INTO uploads (fileName, idx) VALUES (?, ?)",
                        (str(fileName),
                         str(index))
                    )
                except sqlite3.Error as e:
                    print(f"Database error: {e}")
                conn.commit()
                conn.close()

            print(f"Created index with {len(documents)} documents")
            return True, {"processed_files": [os.path.basename(p) for p in filepaths]}
        except Exception as e:
            print(f"Error processing files: {str(e)}")
            return False, f"Processing failed: {str(e)}"

    def getUploads(self):
        conn = sqlite3.connect(CONFIG["uploads"])
        cursor = conn.cursor()
        cursor.execute("SELECT id, fileName, idx  FROM uploads")
        rules = cursor.fetchall()
        json_data = [{"id": item[0], "fileName": item[1], "index": item[2]}
                     for item in rules]
        json_string = json.dumps(json_data, indent=2)
        return json_string

    def extract_rules(self, index, fileName, query: str):
        print(index)
        print(fileName)

        print("extract_rules called")
        """Extract rules from documents using LLM with better prompting"""
        if not index:
            print("index error")
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

            self._store_rules(parsed["rules"], fileName)
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

    def _store_rules(self, rules: List[Dict], fileName):
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
                         str(fileName))
                    )
                except sqlite3.Error as e:
                    print(f"Database error: {e}")
            conn.commit()
            conn.close()


class RuleGenerator:
    # (Same as original, minus Gradio-specific code)
    def update_rule_dropdown():
        conn = sqlite3.connect(CONFIG["rules_db"])
        cursor = conn.cursor()
        cursor.execute("SELECT id, rule_name, source_document  FROM rules")
        rules = cursor.fetchall()
        json_data = [{"id": item[0], "rule_name": item[1], "file_name": item[2]}
                     for item in rules]
        json_string = json.dumps(json_data, indent=2)
        return json_string


class Validator:
    def __init__(self):
        print("__init__ called")

    def generate_function(self, file_name):
        conn = sqlite3.connect(CONFIG["rules_db"])
        cursor = conn.cursor()
        cursor.execute(
            "SELECT rule_name, rule_description, rule_condition, error_message, source_document FROM rules WHERE source_document=?", (
                file_name, ))
        rules = cursor.fetchall()
        functions = []
        for rule in rules:
            func_name = re.sub(r'\W+|^(?=\d)', '_', rule[0].lower())
            function_code = f'''
def {func_name}(df: pd.DataFrame) -> pd.DataFrame:
    """{rule[0]}
    Condition: {rule[2]}
    """
    try:
        # Find violating rows
        violations = df[~({rule[2]})].copy()

        # Add validation metadata
        violations['__rule_name'] = '{rule[0]}'
        violations['__error'] = '{rule[3]}'

        # Return original columns plus validation info
        return violations[['__rule_name', '__error'] + list(df.columns)]
    except Exception as e:
        # Return error if validation fails
        return pd.DataFrame({{
            '__rule_name': ['{rule[1]}'],
            '__error': [f'Validation error: {{str(e)}}']
        }})
            '''
            functions.append([rule[4], rules[0], rule[1],
                              rule[2], rule[3], function_code])
        # print(rules)
        # print(functions)
        json_data = [{"file_name": func[0], "rule_name": func[1], "rule_description": func[2], "condition": func[3], "error_message": func[4], "function_code": func[5]}
                     for func in functions]

        with db_lock:
            conn = sqlite3.connect(CONFIG["validation_functions_db"])
            cursor = conn.cursor()
            for func in functions:
                try:
                    # print(type(func[2]), type(func[3]),
                    #   type(func[4]), type(func[4]))
                    cursor.execute(
                        "INSERT INTO validation_functions (fileName, rule_name, rule_description, rule_condition, error_message, code) VALUES (?, ?, ?, ?, ?, ?)",
                        (func[0],
                         str(func[1]),
                         func[2],
                         func[3],
                         func[4],
                         str(func[5]))
                    )
                except sqlite3.Error as e:
                    print(f"Database error: {e}")
            conn.commit()
            conn.close()
        return True, json_data
