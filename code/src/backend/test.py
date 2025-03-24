# backend.py - FastAPI backend service
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import pandas as pd
import os
import json
import re
from typing import List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from threading import Lock
import uvicorn

load_dotenv()

# Configuration
CONFIG = {
    "documents_dir": "regulatory_docs",
    "rules_db": "rules.db",
    "flagged_items_db": "flagged_items.db",
    "hf_api_key": os.getenv("HF_API_KEY"),
    "llm_model": "mistralai/Mistral-7B-Instruct-v0.1",
    "embedding_model": "sentence-transformers/all-mpnet-base-v2",
    "max_tokens": 2000
}

# Initialize FastAPI app
app = FastAPI(title="Gen AI Data Profiling Backend")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database lock
db_lock = Lock()

# Pydantic models for request/response validation
class DocumentUploadRequest(BaseModel):
    file_paths: List[str]

class RuleExtractionRequest(BaseModel):
    query: str

class ValidationRequest(BaseModel):
    rule_id: int = None
    data: Dict[str, List]  # DataFrame as dict

class RemediationRequest(BaseModel):
    flagged_id: int

# Initialize services
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, Settings
from llama_index.llms.huggingface import HuggingFaceInferenceAPI
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from huggingface_hub import InferenceClient

client = InferenceClient(token=CONFIG["hf_api_key"])

Settings.llm = HuggingFaceInferenceAPI(
    model_name=CONFIG["llm_model"],
    token=CONFIG["hf_api_key"]
)
Settings.embed_model = HuggingFaceEmbedding(
    model_name=CONFIG["embedding_model"]
)
Settings.chunk_size = 512
Settings.chunk_overlap = 20

# Document Processing Endpoints
@app.post("/documents/upload")
async def upload_documents(request: DocumentUploadRequest):
    print("PARVA LOVES PARVA")
    return {"status": "success", "message": "parva"}


    # """Upload and process regulatory documents"""
    # processor = DocumentProcessor()
    # try:
    #     result = processor.load_documents(request.file_paths)
    #     return {"status": "success", "message": result}
    # except Exception as e:
    #     print("PARVA LOVES PARVA")
    #     raise HTTPException(status_code=500, detail=str(e))

@app.post("/rules/extract")
async def extract_rules(request: RuleExtractionRequest):
    """Extract rules from documents"""
    processor = DocumentProcessor()
    try:
        rules = processor.extract_rules(request.query)
        return {"status": "success", "rules": rules}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rules/list")
async def list_rules():
    """List all available rules"""
    with db_lock:
        conn = sqlite3.connect(CONFIG["rules_db"])
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, rule_name, rule_description FROM rules")
        rules = [dict(row) for row in cursor.fetchall()]
        conn.close()
    return {"status": "success", "rules": rules}

# Rule Generation Endpoints
@app.post("/validation/generate")
async def generate_validation_code(rule_id: int):
    """Generate validation code for a rule"""
    generator = RuleGenerator()
    try:
        functions = generator.generate_validation_code(rule_id)
        return {"status": "success", "validation_functions": functions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Data Validation Endpoints
@app.post("/data/validate")
async def validate_data(request: ValidationRequest):
    """Validate data against rules"""
    validator = DataValidator()
    generator = RuleGenerator()
    
    try:
        # Convert data dict to DataFrame
        df = pd.DataFrame(request.data)
        
        # Get validation functions
        functions = generator.generate_validation_code(request.rule_id)
        
        # Validate data
        results = validator.validate_data(functions, df)
        
        return {
            "status": "success",
            "results": results.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/flagged/list")
async def list_flagged_items():
    """List all flagged items"""
    with db_lock:
        conn = sqlite3.connect(CONFIG["flagged_items_db"])
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM flagged_items WHERE status = 'open'")
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()
    return {"status": "success", "flagged_items": items}

@app.post("/remediation/generate")
async def generate_remediation(request: RemediationRequest):
    """Generate remediation for flagged item"""
    validator = DataValidator()
    try:
        remediation = validator.generate_remediation(request.flagged_id)
        return {"status": "success", "remediation": remediation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include all the class implementations from the original code here
# (DocumentProcessor, RuleGenerator, DataValidator, ReportGenerator)

if __name__ == "__main__":
    # Initialize databases
    for db in [CONFIG["rules_db"], CONFIG["flagged_items_db"]]:
        if not os.path.exists(db):
            open(db, 'w').close()

    uvicorn.run(app, host="0.0.0.0", port=8000)