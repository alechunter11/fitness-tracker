"""
build_percentiles.py — Generates percentile lookup tables for scoring.
Outputs app/percentiles.json.

Sources:
- Strength: van den Hoek et al. 2024 (J Sci Med Sport), 809,986 powerlifting entries.
  These are TRAINED competitor percentiles. For a general-population overall "99",
  we shift the curve so that 90th percentile competitor ≈ 99 general overall.
- Endurance / Speed: Cooper Institute & Texas DPS PRT 1.5-mile run standards
  (used by law enforcement; well-documented age/sex normative data).

The "99 overall" scoring works as follows:
  Each lift/run produces a raw value -> ratio (weight/bodyweight, or pace).
  We interpolate the ratio against the percentile table for the user's
  age × sex bracket to produce a 0-99 score.
"""
import json
from pathlib import Path

OUT = Path(__file__).parent.parent / "app" / "percentiles.json"

# ============================================================
# STRENGTH: Relative strength (lift / bodyweight) by percentile
# Source: van den Hoek 2024 + Barbell Medicine analysis.
# Format: {sex: {age_bracket: {lift: [(percentile, ratio), ...]}}}
# Brackets: 18-23, 24-39, 40-49, 50-59, 60+
# Lifts: bench (upper body), squat (lower body), deadlift (lower body)
# ============================================================

STRENGTH = {
    "male": {
        "18-23": {
            "bench":    [(10, 0.85), (25, 1.10), (50, 1.40), (75, 1.70), (90, 1.95), (99, 2.40)],
            "squat":    [(10, 1.20), (25, 1.60), (50, 2.05), (75, 2.45), (90, 2.83), (99, 3.40)],
            "deadlift": [(10, 1.50), (25, 1.95), (50, 2.45), (75, 2.85), (90, 3.25), (99, 3.85)],
        },
        "24-39": {
            "bench":    [(10, 0.80), (25, 1.05), (50, 1.35), (75, 1.65), (90, 1.90), (99, 2.30)],
            "squat":    [(10, 1.15), (25, 1.55), (50, 2.00), (75, 2.40), (90, 2.78), (99, 3.30)],
            "deadlift": [(10, 1.45), (25, 1.90), (50, 2.40), (75, 2.80), (90, 3.20), (99, 3.75)],
        },
        "40-49": {
            "bench":    [(10, 0.70), (25, 0.95), (50, 1.25), (75, 1.55), (90, 1.80), (99, 2.15)],
            "squat":    [(10, 1.05), (25, 1.40), (50, 1.85), (75, 2.25), (90, 2.60), (99, 3.10)],
            "deadlift": [(10, 1.30), (25, 1.75), (50, 2.20), (75, 2.60), (90, 3.00), (99, 3.50)],
        },
        "50-59": {
            "bench":    [(10, 0.60), (25, 0.85), (50, 1.15), (75, 1.40), (90, 1.65), (99, 2.00)],
            "squat":    [(10, 0.95), (25, 1.30), (50, 1.70), (75, 2.05), (90, 2.40), (99, 2.85)],
            "deadlift": [(10, 1.15), (25, 1.55), (50, 2.00), (75, 2.40), (90, 2.75), (99, 3.20)],
        },
        "60+": {
            "bench":    [(10, 0.50), (25, 0.70), (50, 1.00), (75, 1.25), (90, 1.50), (99, 1.85)],
            "squat":    [(10, 0.80), (25, 1.10), (50, 1.50), (75, 1.85), (90, 2.15), (99, 2.55)],
            "deadlift": [(10, 1.00), (25, 1.35), (50, 1.75), (75, 2.10), (90, 2.45), (99, 2.90)],
        },
    },
    "female": {
        "18-23": {
            "bench":    [(10, 0.50), (25, 0.70), (50, 0.95), (75, 1.15), (90, 1.35), (99, 1.65)],
            "squat":    [(10, 0.80), (25, 1.15), (50, 1.55), (75, 1.90), (90, 2.26), (99, 2.75)],
            "deadlift": [(10, 1.05), (25, 1.45), (50, 1.95), (75, 2.30), (90, 2.66), (99, 3.20)],
        },
        "24-39": {
            "bench":    [(10, 0.48), (25, 0.68), (50, 0.92), (75, 1.12), (90, 1.32), (99, 1.60)],
            "squat":    [(10, 0.78), (25, 1.12), (50, 1.52), (75, 1.85), (90, 2.20), (99, 2.65)],
            "deadlift": [(10, 1.00), (25, 1.40), (50, 1.90), (75, 2.25), (90, 2.60), (99, 3.10)],
        },
        "40-49": {
            "bench":    [(10, 0.42), (25, 0.60), (50, 0.85), (75, 1.05), (90, 1.22), (99, 1.50)],
            "squat":    [(10, 0.70), (25, 1.00), (50, 1.40), (75, 1.70), (90, 2.00), (99, 2.45)],
            "deadlift": [(10, 0.90), (25, 1.25), (50, 1.70), (75, 2.05), (90, 2.40), (99, 2.85)],
        },
        "50-59": {
            "bench":    [(10, 0.38), (25, 0.55), (50, 0.78), (75, 0.95), (90, 1.12), (99, 1.40)],
            "squat":    [(10, 0.62), (25, 0.90), (50, 1.25), (75, 1.55), (90, 1.85), (99, 2.25)],
            "deadlift": [(10, 0.80), (25, 1.10), (50, 1.55), (75, 1.85), (90, 2.20), (99, 2.65)],
        },
        "60+": {
            "bench":    [(10, 0.32), (25, 0.48), (50, 0.70), (75, 0.88), (90, 1.05), (99, 1.30)],
            "squat":    [(10, 0.55), (25, 0.80), (50, 1.10), (75, 1.40), (90, 1.68), (99, 2.05)],
            "deadlift": [(10, 0.70), (25, 1.00), (50, 1.40), (75, 1.70), (90, 2.00), (99, 2.45)],
        },
    },
}

# ============================================================
# ENDURANCE: 1.5-mile run time in SECONDS by percentile
# Lower = better. Source: Cooper Institute / Texas DPS PRT standards.
# We list the time (sec) achieved AT that percentile.
# ============================================================

RUN_15MILE = {
    "male": {
        "18-23": [(10, 14*60+30), (25, 13*60+15), (50, 12*60+0),  (75, 10*60+45), (90, 9*60+30),  (99, 8*60+45)],
        "24-39": [(10, 15*60+0),  (25, 13*60+45), (50, 12*60+25), (75, 11*60+10), (90, 10*60+0),  (99, 9*60+11)],
        "40-49": [(10, 16*60+15), (25, 14*60+45), (50, 13*60+30), (75, 12*60+10), (90, 10*60+50), (99, 9*60+54)],
        "50-59": [(10, 17*60+30), (25, 16*60+0),  (50, 14*60+40), (75, 13*60+10), (90, 11*60+50), (99, 10*60+50)],
        "60+":   [(10, 19*60+0),  (25, 17*60+30), (50, 16*60+0),  (75, 14*60+30), (90, 13*60+0),  (99, 11*60+50)],
    },
    "female": {
        "18-23": [(10, 17*60+15), (25, 15*60+50), (50, 14*60+25), (75, 13*60+0),  (90, 11*60+50), (99, 10*60+50)],
        "24-39": [(10, 17*60+50), (25, 16*60+25), (50, 14*60+50), (75, 13*60+30), (90, 12*60+15), (99, 11*60+13)],
        "40-49": [(10, 19*60+0),  (25, 17*60+25), (50, 15*60+50), (75, 14*60+20), (90, 13*60+0),  (99, 12*60+0)],
        "50-59": [(10, 20*60+30), (25, 19*60+0),  (50, 17*60+15), (75, 15*60+45), (90, 14*60+20), (99, 13*60+10)],
        "60+":   [(10, 22*60+0),  (25, 20*60+30), (50, 18*60+50), (75, 17*60+10), (90, 15*60+40), (99, 14*60+20)],
    },
}

# ============================================================
# SPEED: 1-mile pace in seconds, derived from 1.5-mile run.
# We provide direct 1-mile time targets (faster than 1.5-mile pace) for the
# Speed score when user logs a 1-mile run.
# Source: Marathon Handbook / RunRepeat aggregate recreational runner data.
# ============================================================

RUN_1MILE = {
    "male": {
        "18-23": [(10, 9*60+0),  (25, 8*60+15), (50, 7*60+15), (75, 6*60+30), (90, 5*60+50), (99, 5*60+5)],
        "24-39": [(10, 9*60+15), (25, 8*60+30), (50, 7*60+30), (75, 6*60+45), (90, 6*60+5),  (99, 5*60+20)],
        "40-49": [(10, 9*60+45), (25, 9*60+0),  (50, 8*60+0),  (75, 7*60+15), (90, 6*60+30), (99, 5*60+45)],
        "50-59": [(10, 10*60+30), (25, 9*60+45), (50, 8*60+45), (75, 7*60+50), (90, 7*60+5), (99, 6*60+15)],
        "60+":   [(10, 11*60+30), (25, 10*60+30), (50, 9*60+30), (75, 8*60+30), (90, 7*60+45), (99, 6*60+50)],
    },
    "female": {
        "18-23": [(10, 10*60+30), (25, 9*60+30), (50, 8*60+30), (75, 7*60+45), (90, 7*60+0),  (99, 6*60+10)],
        "24-39": [(10, 10*60+45), (25, 9*60+45), (50, 8*60+45), (75, 8*60+0),  (90, 7*60+15), (99, 6*60+25)],
        "40-49": [(10, 11*60+30), (25, 10*60+30), (50, 9*60+30), (75, 8*60+30), (90, 7*60+45), (99, 6*60+50)],
        "50-59": [(10, 12*60+30), (25, 11*60+30), (50, 10*60+15), (75, 9*60+15), (90, 8*60+30), (99, 7*60+30)],
        "60+":   [(10, 13*60+45), (25, 12*60+30), (50, 11*60+15), (75, 10*60+15), (90, 9*60+15), (99, 8*60+15)],
    },
}

# ============================================================
# EXERCISE -> SCORING CATEGORY MAPPING
# Each workout-plan exercise contributes to one or more score categories.
# Score categories: upper_strength, lower_strength, endurance, speed, core
# For lifts, we use top-set weight as a proxy and compare against bench/squat/deadlift
# anchors (chosen surrogate). For runs, the mile time drives speed AND endurance.
# ============================================================

EXERCISE_MAP = {
    # ---- UPPER BODY (use bench as the anchor ratio table) ----
    "Dumbell Bench":            {"category": "upper_strength", "anchor": "bench",    "effort": 1.00, "is_dumbbell_pair": True},
    "Inclince Bench":           {"category": "upper_strength", "anchor": "bench",    "effort": 0.85, "is_dumbbell_pair": True},
    "Lower Cable Flys (Serise)":{"category": "upper_strength", "anchor": "bench",    "effort": 0.30, "is_dumbbell_pair": False},
    "Mid Cable Flys (Serise)":  {"category": "upper_strength", "anchor": "bench",    "effort": 0.30, "is_dumbbell_pair": False},
    "High Cable Flys (Serise)": {"category": "upper_strength", "anchor": "bench",    "effort": 0.30, "is_dumbbell_pair": False},
    "Tricep PushDown (Serise)": {"category": "upper_strength", "anchor": "bench",    "effort": 0.45, "is_dumbbell_pair": False},
    "Tricep Overheads (Serise)":{"category": "upper_strength", "anchor": "bench",    "effort": 0.40, "is_dumbbell_pair": False},
    "Shoulder Flys":            {"category": "upper_strength", "anchor": "bench",    "effort": 0.18, "is_dumbbell_pair": True},
    "Shoulder Raises":          {"category": "upper_strength", "anchor": "bench",    "effort": 0.25, "is_dumbbell_pair": True},
    "Lat Pull Down":            {"category": "upper_strength", "anchor": "bench",    "effort": 0.75, "is_dumbbell_pair": False},
    "Cable Rows":               {"category": "upper_strength", "anchor": "bench",    "effort": 0.80, "is_dumbbell_pair": False},
    "Hammer Curls":             {"category": "upper_strength", "anchor": "bench",    "effort": 0.35, "is_dumbbell_pair": True},
    "Preacher Curls":           {"category": "upper_strength", "anchor": "bench",    "effort": 0.45, "is_dumbbell_pair": False},
    "Face Pulls":               {"category": "upper_strength", "anchor": "bench",    "effort": 0.40, "is_dumbbell_pair": False},
    "Alternate Dumbell Curls":  {"category": "upper_strength", "anchor": "bench",    "effort": 0.35, "is_dumbbell_pair": True},
    # ---- LOWER BODY (use squat as anchor) ----
    "Leg Press":                {"category": "lower_strength", "anchor": "squat",    "effort": 2.40, "is_dumbbell_pair": False},
    "Leg Curls":                {"category": "lower_strength", "anchor": "squat",    "effort": 0.70, "is_dumbbell_pair": False},
    "Leg Extension":            {"category": "lower_strength", "anchor": "squat",    "effort": 0.85, "is_dumbbell_pair": False},
    "Dumbell Lunge":            {"category": "lower_strength", "anchor": "squat",    "effort": 0.45, "is_dumbbell_pair": True},
    "Calf Raises":              {"category": "lower_strength", "anchor": "squat",    "effort": 0.60, "is_dumbbell_pair": False},
    # ---- CORE / TIMED (no scoring, but tracked) ----
    "Reverse Crunch":           {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Russian Twist":            {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Sit ups":                  {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Bicycles":                 {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Leg Raises":               {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Flutter Kicks":            {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Mountain Climbers":        {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Alternate Hand to Toe":    {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    "Crunches":                 {"category": "core",           "anchor": None,       "effort": None, "is_dumbbell_pair": False},
    # ---- CARDIO ----
    "Treadmill":                {"category": "endurance_speed","anchor": None,       "effort": None, "is_dumbbell_pair": False},
}


def main():
    payload = {
        "_about": (
            "Percentile lookup tables. Strength: ratio = lift/bodyweight (lbs). "
            "For dumbbell exercises that hold one DB per hand, multiply DB weight by 2 "
            "to get total weight moved before computing the ratio. The 'effort' factor "
            "in EXERCISE_MAP normalizes an exercise's typical top-set weight to the "
            "anchor lift (bench/squat). Score formula: "
            "normalized_ratio = (top_set_total_weight / bodyweight) / effort, "
            "then interpolate against the anchor table to get a 0-99 score."
        ),
        "strength": STRENGTH,
        "run_15mile_seconds": RUN_15MILE,
        "run_1mile_seconds": RUN_1MILE,
        "exercise_map": EXERCISE_MAP,
        "age_brackets": ["18-23", "24-39", "40-49", "50-59", "60+"],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2))
    print(f"Wrote {OUT}")
    print(f"Strength brackets: {sum(len(v) for v in STRENGTH.values())}")
    print(f"Exercises mapped: {len(EXERCISE_MAP)}")


if __name__ == "__main__":
    main()
