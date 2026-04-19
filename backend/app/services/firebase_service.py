import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv

load_dotenv()

class FirebaseService:
    _instance = None
    _db = None
    _bucket = None

    @classmethod
    def init(cls):
        if cls._instance is not None:
            return cls._instance

        cls._instance = cls()
        
        if not firebase_admin._apps:
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
            cred_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
            storage_bucket = os.getenv('FIREBASE_STORAGE_BUCKET')

            if not cred_path and not cred_json:
                raise ValueError("Configuração do Firebase ausente: FIREBASE_CREDENTIALS_PATH ou FIREBASE_CREDENTIALS_JSON necessários.")
            
            if cred_json:
                cred_dict = json.loads(cred_json)
                cred = credentials.Certificate(cred_dict)
            elif cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                raise FileNotFoundError(f"Arquivo de credenciais não encontrado: {cred_path}")
            
            options = {}
            if storage_bucket:
                options['storageBucket'] = storage_bucket
                
            firebase_admin.initialize_app(cred, options)
            
        cls._db = firestore.client()
        cls._bucket = storage.bucket() if os.getenv('FIREBASE_STORAGE_BUCKET') else None
        
        return cls._instance

    @classmethod
    def get(cls):
        if cls._instance is None:
            raise RuntimeError("FirebaseService não foi inicializado. Chame FirebaseService.init() no startup.")
        return cls._instance

    @property
    def db(self):
        return self._db

    @property
    def bucket(self):
        return self._bucket
