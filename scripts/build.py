import re, os, glob, random, hashlib, json
from datetime import datetime, timedelta, timezone

minified_dir = "js/minified"

def minify_js(code):
    lines = code.split("\n")
    lines = [line.strip() for line in lines]
    lines = [line for line in lines if line != ""]
    lines = [line for line in lines if not line.startswith("//")]

    is_collapseable = lambda line: re.match(r"^[\(\)\{\}\s\]\[\=]+$", line)

    for i in range(10):
        # for i, line in enumerate(lines):
        #     if is_collapseable(line) and i > 0:
        #         lines[i - 1] += line
        #         lines[i] = ""
            
        lines = [line.strip() for line in lines]
        lines = [line for line in lines if line != ""]
        
    code = "\n".join(lines)
    return code

def clear_minified_files():
    for file in os.listdir(minified_dir):
        os.remove(f"{minified_dir}/{file}")

def make_minified_file(js_imports, file_dict):
    content = ""

    for js_file in js_imports:
        with open(js_file, "r", encoding="utf-8") as file:
            content += minify_js(file.read()) + "\n"

    name = "j"
    name += hashlib.sha256(content.encode('utf-8')).hexdigest()[0:16]
    name += ".min.js"
    path = f"{minified_dir}/{name}"

    with open(path, "w", encoding="utf-8") as file:
        file.write(content)

    return file_dict["base-path"] + path

def get_templates(dir):
    files = os.listdir(dir)
    templates = {}
    for file_name in files:
        path = f"{dir}/{file_name}"
        if "." in file_name:
            name = file_name[::-1].split(".", 1)[1][::-1]
        else:
            name = file_name
        with open(path, "r", encoding="utf-8") as file:
            templates[name] = file.read()
    return templates

def make_js_imports(js_imports, file_dict):
    out = ""
    version = file_dict["js_version"] if "js_version" in file_dict else 0
    base = file_dict["base-path"]
    module_str = " type=\"module\"" if "js_module" in file_dict and file_dict["js_module"] == "true" else ""
    for js_import in js_imports:
        out += f"<script{module_str} src=\"{base}{js_import}?v{version}\"></script>\n"
    return out[:-1]

SET_regex = r"^[\s\t]*<!--\s*SET\s+([a-zA-Z0-9_\.]+)\s*=\s*([a-zA-Z0-9_\-\s\|\.\:\;\/\\\!\?äöüßÄÜÖ]+?)\s*-->[\s\t]*$"
BEGIN_regex = r"^[\s\t]*<!--\s*BEGIN\s+([a-zA-Z0-9_\.]+)\s*-->[\s\t]*$"
END_regex = r"^([\s\t]*)<!--\s*END\s*-->[\s\t]*$"
JS_IMPORT_regex = r"^[\s\t]*<!--\s*JS_IMPORT\s+([a-zA-Z0-9_\.\/\\\-]+)\s*-->[\s\t]*$"

def handle_file(file_path: str):
    file_dict = {}
    js_imports = []
    insert_info = {"start_line": None, "name": None, "found": False}
    new_lines = []

    directory_depth = file_path.count('\\') + file_path.count("/")
    file_dict["base-path"] = "../" * (directory_depth - 1)
    file_dict["logo_name"] = "RecMaths"

    with open(file_path, "r", encoding="utf-8") as file:
        lines = file.read().split("\n")
        for i, line in enumerate(lines):
            add_line = True
            SET_search = re.search(SET_regex, line)
            BEGIN_search = re.search(BEGIN_regex, line)
            END_search = re.search(END_regex, line)
            JS_IMPORT_search = re.search(JS_IMPORT_regex, line)

            if (SET_search):
                key, value = SET_search.group(1), SET_search.group(2)
                file_dict[key] = value
            elif (BEGIN_search):
                insert_info["found"] = True
                insert_info["name"] = BEGIN_search.group(1)
                insert_info["start_line"] = i
            elif (END_search and insert_info["found"]):
                indent, name = END_search.group(1), insert_info["name"]
                if (name in templates):
                    template = templates[name]
                    for key, value in file_dict.items():
                        template = template.replace(f"${key}$", value)
                    template_lines = template.split("\n")
                    new_lines.extend([indent + l for l in template_lines])
                elif name == "js_imports":
                    if "js_minify" in file_dict and file_dict["js_minify"] == "true":
                        minified_file = make_minified_file(js_imports, file_dict)
                        js_version = file_dict["js_version"] if "js_version" in file_dict else 0
                        js_module_str = 'type="module" ' if "js_module" in file_dict and file_dict["js_module"] == "true" else ""
                        template_lines = [f"<script {js_module_str}src=\"{minified_file}?v{js_version}\"></script>"]
                        new_lines.extend([indent + l for l in template_lines])
                    else:
                        template_lines = make_js_imports(js_imports, file_dict).split("\n")
                        new_lines.extend([indent + l for l in template_lines])
                else:
                    print(f"[{file_path}] unknown template: \"{name}\"")
                insert_info["found"] = False
            elif (JS_IMPORT_search):
                js_imports.append(JS_IMPORT_search.group(1))
            elif (insert_info["found"]):
                add_line = False

            if add_line:
                new_lines.append(line)

        if insert_info["found"]:
            # the last BEGIN wasn't followed by an END
            # then revert changes
            print(f"unmatched BEGIN in {file_path}")
            new_lines = lines  
        elif new_lines != lines:
            print(f"made changes in {file_path}")

        # print(file_path)
        # print(file_dict)
        # print()

        with open(file_path, "w", encoding="utf-8") as file:
            file.write("\n".join(new_lines))

template_dir = "scripts/templates"
templates = get_templates(template_dir)

def build_htmls():
    clear_minified_files()

    for file in os.listdir(template_dir):
        handle_file(f"{template_dir}/{file}")

    index_files = glob.glob("./**/index.html", recursive=True)
    for file_path in index_files:
        handle_file(file_path)

def build_events_ics():
    """Build the subscription calendar from events.json (Europe/Zurich times)."""
    def escape_text(value):
        return (value.replace("\\", "\\\\")
                     .replace("\r\n", "\n").replace("\r", "\n")
                     .replace("\n", "\\n")
                     .replace(";", "\\;").replace(",", "\\,"))

    def fold_line(line):
        # iCalendar limits physical lines to 75 UTF-8 bytes, including indentation.
        parts = []
        part = ""
        length = 0
        for character in line:
            size = len(character.encode("utf-8"))
            if length + size > 75:
                parts.append(part)
                part = " "
                length = 1
            part += character
            length += size
        parts.append(part)
        return "\r\n".join(parts)

    with open("events.json", "r", encoding="utf-8") as file:
        events = json.load(file)

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//RecMaths//Events//EN",
        "CALSCALE:GREGORIAN",
        "X-WR-CALNAME:RecMaths Events",
        # Swiss daylight-saving rules in effect since 1996. Embed the timezone
        # so clients do not interpret the meetup times in their own timezone.
        "BEGIN:VTIMEZONE",
        "TZID:Europe/Zurich",
        "BEGIN:DAYLIGHT",
        "DTSTART:19960331T020000",
        "TZOFFSETFROM:+0100",
        "TZOFFSETTO:+0200",
        "TZNAME:CEST",
        "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
        "END:DAYLIGHT",
        "BEGIN:STANDARD",
        "DTSTART:19961027T030000",
        "TZOFFSETFROM:+0200",
        "TZOFFSETTO:+0100",
        "TZNAME:CET",
        "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
        "END:STANDARD",
        "END:VTIMEZONE",
    ]
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    for event in events:
        start_time, end_time = event["time"].split("-")
        start = datetime.strptime(f'{event["date"]} {start_time.strip()}', "%d.%m.%Y %H:%M")
        end = datetime.strptime(f'{event["date"]} {end_time.strip()}', "%d.%m.%Y %H:%M")
        if end <= start:
            end += timedelta(days=1)

        # Titles identify meetups, keeping IDs stable when dates or rooms change.
        uid = hashlib.sha256(event["title"].encode("utf-8")).hexdigest()
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}@recmaths.ch",
            f"DTSTAMP:{stamp}",
            f'DTSTART;TZID=Europe/Zurich:{start.strftime("%Y%m%dT%H%M%S")}',
            f'DTEND;TZID=Europe/Zurich:{end.strftime("%Y%m%dT%H%M%S")}',
            f'SUMMARY:{escape_text(event["title"])}',
            f'LOCATION:{escape_text(event["location"])}',
        ])
        if event.get("locationUrl"):
            lines.append(f'DESCRIPTION:{escape_text(event["locationUrl"])}')
        lines.append("END:VEVENT")
    lines.append("END:VCALENDAR")

    with open("events.ics", "w", encoding="utf-8", newline="") as file:
        file.write("\r\n".join(fold_line(line) for line in lines) + "\r\n")

if __name__ == "__main__":
    build_htmls()
    build_events_ics()
