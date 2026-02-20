import sys
import os

def lazy_load_file(file_path, chunk_size=1000):
    """
    Generador que lee un archivo en fragmentos (chunks) de tamaño especificado.
    """
    if not os.path.exists(file_path):
        yield f"Error: Archivo no encontrado en {file_path}"
        return

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk
    except Exception as e:
        yield f"Error leyendo el archivo: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python lazy_reader.py <input_file> [chunk_size]")
        sys.exit(1)

    path = sys.argv[1]
    size = int(sys.argv[2]) if len(sys.argv) > 2 else 1000

    # Si se invoca directamente, imprimimos el primer fragmento y esperamos entrada para el siguiente
    # Esto es útil para que el agente controle la lectura.
    gen = lazy_load_file(path, size)
    for i, fragment in enumerate(gen):
        print(f"--- Fragmento {i+1} ---")
        print(fragment)
        if i < 0: # Cambiar si se quiere interactivo, por ahora solo el primero para demo
             break
        # Nota: El agente usará esta función internamente o el script para obtener chunks específicos.
