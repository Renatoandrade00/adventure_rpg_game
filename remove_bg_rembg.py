import os
from rembg import remove
from PIL import Image

files = [
    "enemy_zombie.png", "enemy_scorpion.png", "enemy_yeti.png", "enemy_ice_troll.png",
    "enemy_basilisk.png", "enemy_manticore.png", "enemy_cyclops.png", "enemy_lich.png",
    "enemy_behemoth.png", "enemy_demon_king.png", "npc_border_guard.png", 
    "npc_treasure_hunter.png", "npc_exiled_mage.png", "npc_royal_knight.png"
]

base_dir = r"d:\Renato\PROJETOS\03 - PROJETO JOGO RPG\frontend\public\assets"

for f in files:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        print(f"Removing background from {f} using rembg...")
        with open(path, 'rb') as i:
            with open(path, 'wb') as o:
                # We need to read it fully, process it, then overwrite
                pass # better to use PIL
        
        try:
            input_image = Image.open(path)
            output_image = remove(input_image)
            output_image.save(path)
            print(f"Done: {f}")
        except Exception as e:
            print(f"Error on {f}: {e}")
    else:
        print(f"File not found: {f}")
