from models import init_db
from services import DocumentProcessor, RuleGenerator, Validator
from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import InferenceClient
from werkzeug.utils import secure_filename
import uuid
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx', 'txt'}
CORS(app)


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


@app.route('/api/upload/get', methods=['GET'])
def send_uploads():
    return DocumentProcessor().getUploads()


@app.route('/api/extract-rules', methods=['POST'])
def extract_rules_api():
    data = request.json
    query = data.get('query', '')
    idx = data.get('index', '')
    fileName = data.get('fileName', '')
    print(query)
    print(idx)
    print(fileName)

    success, result = DocumentProcessor().extract_rules(idx, fileName, query)
    if success:
        return jsonify({"rules": result})
    else:
        return jsonify({"error": result}), 500


@app.route('/api', methods=['GET'])
def home():
    return "home success"


@app.route('/api/rules', methods=['GET'])
def send_rules():
    return RuleGenerator.update_rule_dropdown()


@app.route('/api/validate', methods=['POST'])
def validation_function():
    data = request.json
    file_name = data.get('file_name', '')

    success, result = Validator().generate_function(file_name)
    if success:
        return jsonify({"rules": result})
    else:
        return jsonify({"error": result}), 500


if __name__ == '__main__':
    init_db()
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)
