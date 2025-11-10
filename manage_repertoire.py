import json

# Load your JSON data
with open("cleaned_repertoire.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Dictionary of typo corrections
fix_map = {
    "Жастар биы": "Жастар биі",
    "Тепеңкөк": "Тепең көк",
    "Әлқиса": "Әлқисса",
    "Ерке сылқым (1,2 дауыс)": "Ерке сылқым",
    # Add more corrections as needed
}

# Function to clean repertoire
def clean_repertoire(repertoire):
    cleaned = []
    for piece in repertoire:
        # Fix typos
        piece = fix_map.get(piece, piece)
        # Remove duplicates
        if piece not in cleaned:
            cleaned.append(piece)
    return cleaned

# Function to clean group data
def clean_group(group):
    cleaned_group = {}
    for participant in group:
        name = participant["Есім"]
        if name in cleaned_group:
            # If participant already exists, merge repertoires
            combined = cleaned_group[name] + participant["Репертуар"]
            cleaned_group[name] = clean_repertoire(combined)
        else:
            cleaned_group[name] = clean_repertoire(participant["Репертуар"])
    # Convert back to list of dictionaries
    return [{"Есім": k, "Репертуар": v} for k, v in cleaned_group.items()]

# Clean all groups
for group_name in data:
    data[group_name] = clean_group(data[group_name])

# Function to add new repertoire
def add_repertoire(group_name, participant_name, new_pieces):
    if group_name not in data:
        data[group_name] = []
    
    group = data[group_name]
    participant = next((p for p in group if p["Есім"] == participant_name), None)
    new_pieces = clean_repertoire(new_pieces)
    
    if participant:
        # Add new pieces without duplicates
        participant["Репертуар"] = clean_repertoire(participant["Репертуар"] + new_pieces)
    else:
        # Add new participant
        group.append({"Есім": participant_name, "Репертуар": new_pieces})

# Example usage:
# add_repertoire("Үлкен топ", "Жұбаназар Думан", ["Қосалқа", "Нұрлы таң"])

# Save cleaned data
with open("cleaned_repertoire.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Data cleaned and saved to cleaned_repertoire.json")