import sys
import os
try:
    import chromadb
    from chromadb.config import Settings
    HAS_CHROMA = True
except ImportError:
    HAS_CHROMA = False

# Configuración de persistencia local
CHROMA_PATH = os.path.join(os.getcwd(), ".chroma")

def get_client():
    return chromadb.PersistentClient(path=CHROMA_PATH)

def index_files(directory, collection_name="technical_knowledge"):
    client = get_client()
    collection = client.get_or_create_collection(name=collection_name)
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.txt', '.md')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    # Fragmentación simple por ahora (puedes mejorar esto)
                    collection.add(
                        documents=[content],
                        metadatas=[{"source": path}],
                        ids=[path]
                    )
    print(f"Indexación completada para {directory}")

def query_memory(query_text, collection_name="technical_knowledge", n_results=3):
    client = get_client()
    collection = client.get_collection(name=collection_name)
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    return results

def search_keywords(query_text, directory, n_results=3):
    """
    Búsqueda simple por palabras clave como fallback si ChromaDB no está disponible.
    """
    results = []
    keywords = query_text.lower().split()
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.txt', '.md')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        score = sum(1 for kw in keywords if kw in content.lower())
                        if score > 0:
                            results.append({
                                "document": content[:1000] + "...",
                                "metadata": {"source": path},
                                "score": score
                            })
                except:
                    continue
    
    # Ordenar por puntuación
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:n_results]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python vector_engine.py <init|query> [arg]")
        sys.exit(1)

    cmd = sys.argv[1]
    
    # Intentar importar chromadb
    try:
        import chromadb
        HAS_CHROMA = True
    except ImportError:
        HAS_CHROMA = False

    if cmd == "init" and len(sys.argv) > 2:
        if HAS_CHROMA:
            index_files(sys.argv[2])
        else:
            print("ChromaDB no disponible. Saltando indexación vectorial (usando fallback de búsqueda directa).")
    elif cmd == "query" and len(sys.argv) > 2:
        if HAS_CHROMA:
            try:
                res = query_memory(sys.argv[2])
                print(res)
            except:
                print("Error en consulta vectorial. Usando fallback...")
                print(search_keywords(sys.argv[2], "public/pse-knowledge/"))
        else:
            print(search_keywords(sys.argv[2], "public/pse-knowledge/"))
    else:
        print("Comando no reconocido o argumentos faltantes.")
