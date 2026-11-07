"""Erzeugt eine verkleinerte Material-Symbols-Schrift mit nur den Icons, die JobMatch nutzt.

Aufruf (im Ordner frontend/):  python scripts/subset-icons.py
Voraussetzungen: npm install (Paket material-symbols) und  pip install fonttools brotli

Das Skript sucht in src/ nach allen kleingeschriebenen String-Literalen (z. B. name="favorite",
icon: 'handshake', open ? 'expand_less' : 'expand_more') und behält davon die, die als Icon in der
Schrift existieren. Danach werden die Variationsachsen auf die in der App genutzten Werte festgelegt.
Nach dem Hinzufügen neuer Icons das Skript erneut ausführen.
"""
import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "node_modules" / "material-symbols" / "material-symbols-outlined.woff2"
TARGET = ROOT / "src" / "assets" / "fonts" / "material-symbols-subset.woff2"
SKIP_DIRS = {"assets", "data"}  # Bilder/Schriften und ungenutzte Mock-Daten
AXES = {"FILL": 0, "GRAD": 0, "opsz": 24, "wght": 400}  # entspricht Icon.jsx


def collect_tokens() -> set[str]:
    tokens: set[str] = set()
    for path in (ROOT / "src").rglob("*"):
        if path.suffix not in {".js", ".jsx"} or SKIP_DIRS & set(path.relative_to(ROOT / "src").parts):
            continue
        tokens.update(re.findall(r"""['"]([a-z][a-z0-9_]{1,})['"]""", path.read_text(encoding="utf-8")))
    return tokens


def ligature_map(font: TTFont) -> dict[str, str]:
    """Liest die Ligaturen der Schrift: Icon-Name (z. B. 'location_on') -> Glyph (z. B. 'place')."""
    char_of = {glyph: chr(code) for code, glyph in font.getBestCmap().items()}
    result: dict[str, str] = {}

    for lookup in font["GSUB"].table.LookupList.Lookup:
        for table in lookup.SubTable:
            if lookup.LookupType == 7:  # Extension-Lookup
                table = table.ExtSubTable
            if table.LookupType != 4:  # nur Ligaturen
                continue
            for first, ligatures in table.ligatures.items():
                for lig in ligatures:
                    parts = [first, *lig.Component]
                    if all(p in char_of for p in parts):
                        result["".join(char_of[p] for p in parts)] = lig.LigGlyph
    return result


def main() -> None:
    if not SOURCE.exists():
        sys.exit(f"Quelle fehlt: {SOURCE} – zuerst 'npm install' ausführen.")

    font = TTFont(SOURCE)
    ligatures = ligature_map(font)
    names = sorted(collect_tokens() & ligatures.keys())
    glyphs = sorted({ligatures[n] for n in names})
    letters = sorted({ch for name in names for ch in name})

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.layout_closure = False  # sonst kämen über die Ligaturen fast alle Icons wieder hinein
    options.notdef_outline = True
    options.name_IDs = ["*"]

    subsetter = subset.Subsetter(options)
    subsetter.populate(glyphs=glyphs, text="".join(letters))
    subsetter.subset(font)

    font = instancer.instantiateVariableFont(font, AXES)
    font.flavor = "woff2"

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    font.save(TARGET)

    print(f"{len(names)} Icons: {', '.join(names)}")
    print(f"{TARGET.relative_to(ROOT)}: {TARGET.stat().st_size / 1024:.1f} KB (vorher {SOURCE.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
