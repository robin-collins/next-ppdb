#!/usr/bin/env -S uv run --script

# -*- coding: utf-8 -*-

# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "sqlalchemy",
#   "pymysql",
#   "pandas",
# ]
# ///

import re
from collections import Counter
from typing import List, Tuple, Dict

import pandas as pd
from sqlalchemy import create_engine

# ---------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------

# Connection string: using SQLAlchemy + PyMySQL
# You need: pip install "sqlalchemy" "pymysql" "pandas"
CONN_STR = "mysql+pymysql://tech:k1DDl3s2@10.10.10.203:3306/ppdb-app"

# Table / column
TABLE_NAME = "notes"
NOTES_COLUMN = "notes"

# N-gram configuration
NGRAM_RANGE = (2, 6)  # from unigrams to trigrams
MIN_FREQ = 5          # minimum count to report a pattern

# Words to ignore so that "shampoo and groom" ~ "shampoo groom"
STOPWORDS = {
    "and", "&", "with", "the", "a", "an", "to", "of", "for", "on",
    "in", "at", "by", "from", "is", "are", "was", "were", "be",
    "cc",  # if you want to drop "cc" from patterns, keep it here; remove if you want to keep it
}

# Maximum rows to fetch (None = all)
MAX_ROWS = None  # e.g. 100000 if you want to limit for testing

# ---------------------------------------------------------------------
# DATA ACCESS
# ---------------------------------------------------------------------

def fetch_all_notes() -> List[str]:
    engine = create_engine(CONN_STR)
    query = f"SELECT {NOTES_COLUMN} FROM {TABLE_NAME} WHERE {NOTES_COLUMN} IS NOT NULL AND {NOTES_COLUMN} <> ''"
    if MAX_ROWS is not None:
        query += f" LIMIT {int(MAX_ROWS)}"

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)

    return df[NOTES_COLUMN].astype(str).tolist()

# ---------------------------------------------------------------------
# TEXT NORMALIZATION / TOKENIZATION
# ---------------------------------------------------------------------

TOKEN_REGEX = re.compile(r"[a-z0-9$]+")

def normalize_and_tokenize(text: str) -> List[str]:
    """
    Normalize text:
      - lowercase
      - keep alphanumerics and '$'
      - split into tokens
      - remove stopwords
    """
    text = text.lower()
    tokens = TOKEN_REGEX.findall(text)
    tokens = [t for t in tokens if t not in STOPWORDS]
    return tokens

# ---------------------------------------------------------------------
# N-GRAM GENERATION
# ---------------------------------------------------------------------

def generate_ngrams(tokens: List[str], n: int) -> List[Tuple[str, ...]]:
    if len(tokens) < n:
        return []
    return [tuple(tokens[i:i + n]) for i in range(len(tokens) - n + 1)]

def count_ngrams(texts: List[str], ngram_range: Tuple[int, int]) -> Dict[int, Counter]:
    """
    Returns a dict: {n: Counter of n-grams}
    """
    ngram_counters: Dict[int, Counter] = {n: Counter() for n in range(ngram_range[0], ngram_range[1] + 1)}

    for t in texts:
        tokens = normalize_and_tokenize(t)
        if not tokens:
            continue
        for n in range(ngram_range[0], ngram_range[1] + 1):
            ngrams = generate_ngrams(tokens, n)
            ngram_counters[n].update(ngrams)

    return ngram_counters

# ---------------------------------------------------------------------
# OUTPUT / REPORTING
# ---------------------------------------------------------------------

def format_ngram(ngram: Tuple[str, ...]) -> str:
    return " ".join(ngram)

def print_top_ngrams(ngram_counters: Dict[int, Counter], min_freq: int, top_k: int = 250) -> None:
    """
    Print top patterns per n-gram size, filtered by min_freq.
    """
    for n in sorted(ngram_counters.keys()):
        print("=" * 80)
        print(f"Top {top_k} {n}-gram patterns (frequency >= {min_freq})")
        print("=" * 80)

        items = [
            (ngram, count)
            for ngram, count in ngram_counters[n].most_common()
            if count >= min_freq
        ][:top_k]

        if not items:
            print(f"(No {n}-grams with frequency >= {min_freq})\n")
            continue

        for ngram, count in items:
            print(f"{count:6d}  |  {format_ngram(ngram)}")
        print()

def export_to_csv(ngram_counters: Dict[int, Counter], min_freq: int, csv_path: str) -> None:
    """
    Optional helper: dump all n-grams (meeting min_freq) to a CSV for deeper analysis.
    Columns: n, phrase, count
    """
    rows = []
    for n, counter in ngram_counters.items():
        for ngram, count in counter.items():
            if count >= min_freq:
                rows.append({
                    "n": n,
                    "phrase": format_ngram(ngram),
                    "count": count,
                })

    if not rows:
        print("No n-grams to export (after filtering by min_freq).")
        return

    df = pd.DataFrame(rows).sort_values(["n", "count"], ascending=[True, False])
    df.to_csv(csv_path, index=False)
    print(f"Exported {len(df)} n-gram patterns to {csv_path}")

# ---------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------

def main() -> None:
    print("Fetching notes from database...")
    notes = fetch_all_notes()
    print(f"Fetched {len(notes)} notes rows.")

    print("Counting n-gram patterns...")
    ngram_counters = count_ngrams(notes, NGRAM_RANGE)

    print_top_ngrams(ngram_counters, MIN_FREQ, top_k=250)

    # Uncomment if you want CSV export:
    # export_to_csv(ngram_counters, MIN_FREQ, csv_path="notes_ngrams.csv")

if __name__ == "__main__":
    main()
