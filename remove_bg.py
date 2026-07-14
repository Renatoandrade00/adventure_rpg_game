import os
from PIL import Image

def remove_background(image_path, threshold=240):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If pixel is near white or gray/white background, make it transparent
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0))
        # Handle checkerboard backgrounds (sometimes AI generates grey/white checkers)
        # We can just rely on white for now. If there's a specific background color, we might need adjustments.
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(image_path, "PNG")

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
        print(f"Processing {f}...")
        remove_background(path)
    else:
        print(f"File not found: {f}")
