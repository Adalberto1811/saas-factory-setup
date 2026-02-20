import json
from pathlib import Path

# Paths
old_library = Path(r"C:\Users\FVH\AppData\Local\notebooklm-mcp\Data\library.json")
new_library = Path(r"c:\Keys\saas-factory-setup\saas-factory\.claude\skills\notebooklm\data\library.json")

def migrate():
    print(f"[*] Reading old library from {old_library}...")
    with open(old_library, 'r') as f:
        old_data = json.load(f)
    
    old_notebooks = old_data.get('notebooks', [])
    new_notebooks = {}
    
    print(f"[*] Migrating {len(old_notebooks)} notebooks...")
    
    for nb in old_notebooks:
        nb_id = nb.get('id')
        if not nb_id:
            nb_id = nb.get('name', 'unknown').lower().replace(' ', '-')
        
        # Ensure all fields expected by new manager are present
        nb['id'] = nb_id
        nb['topics'] = nb.get('topics', [])
        nb['description'] = nb.get('description', '')
        nb['use_count'] = nb.get('use_count', 0)
        nb['tags'] = nb.get('tags', [])
        nb['use_cases'] = nb.get('use_cases', [])
        nb['content_types'] = nb.get('content_types', [])
        
        new_notebooks[nb_id] = nb
        print(f"  [+] Migrated: {nb.get('name')} ({nb_id})")

    new_data = {
        'notebooks': new_notebooks,
        'active_notebook_id': old_data.get('active_notebook_id'),
        'updated_at': old_data.get('last_modified', old_data.get('updated_at'))
    }

    # Ensure target directory exists
    new_library.parent.mkdir(parents=True, exist_ok=True)

    with open(new_library, 'w') as f:
        json.dump(new_data, f, indent=2)
    
    print(f"[V] Migration complete! Saved to {new_library}")

if __name__ == "__main__":
    migrate()
