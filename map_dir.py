import os
import json

def get_all_files_in_dir(dir_path):
    file_paths = []
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, dir_path)
            if os.name == 'nt':
                # Replace backslashes with forward slashes on Windows
                relative_path = relative_path.replace('\\', '/')
            file_paths.append(relative_path)
    return file_paths

def main():
    dir_path = os.getcwd() # Change this to your desired directory path
    output_file = 'file_map.json'

    file_paths = get_all_files_in_dir(dir_path)

    with open(output_file, 'w') as f:
        json.dump(file_paths, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
