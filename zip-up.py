import os
from glob import glob
from zipfile import ZipFile

if __name__ == '__main__':
    zip_file = 'SmartTitle.zip'
    cwd = os.path.dirname(__file__)
    zip_path = os.path.join(cwd, zip_file)
    src_dir = os.path.join(cwd, 'src')
    if os.path.exists(zip_path):
        os.remove(zip_path)
        print(f'Removing {zip_path}...')
    with ZipFile(zip_path, 'w') as z:
        files = glob('src/**/*', recursive=True)

        for f in files:
            z.write(f, os.path.relpath(f, src_dir))
            print(f'Adding {f} to zip...')
        print(f'Writing {zip_path}...')
