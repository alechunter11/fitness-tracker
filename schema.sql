{
  "_about": "Percentile lookup tables. Strength: ratio = lift/bodyweight (lbs). For dumbbell exercises that hold one DB per hand, multiply DB weight by 2 to get total weight moved before computing the ratio. The 'effort' factor in EXERCISE_MAP normalizes an exercise's typical top-set weight to the anchor lift (bench/squat). Score formula: normalized_ratio = (top_set_total_weight / bodyweight) / effort, then interpolate against the anchor table to get a 0-99 score.",
  "strength": {
    "male": {
      "18-23": {
        "bench": [
          [
            10,
            0.85
          ],
          [
            25,
            1.1
          ],
          [
            50,
            1.4
          ],
          [
            75,
            1.7
          ],
          [
            90,
            1.95
          ],
          [
            99,
            2.4
          ]
        ],
        "squat": [
          [
            10,
            1.2
          ],
          [
            25,
            1.6
          ],
          [
            50,
            2.05
          ],
          [
            75,
            2.45
          ],
          [
            90,
            2.83
          ],
          [
            99,
            3.4
          ]
        ],
        "deadlift": [
          [
            10,
            1.5
          ],
          [
            25,
            1.95
          ],
          [
            50,
            2.45
          ],
          [
            75,
            2.85
          ],
          [
            90,
            3.25
          ],
          [
            99,
            3.85
          ]
        ]
      },
      "24-39": {
        "bench": [
          [
            10,
            0.8
          ],
          [
            25,
            1.05
          ],
          [
            50,
            1.35
          ],
          [
            75,
            1.65
          ],
          [
            90,
            1.9
          ],
          [
            99,
            2.3
          ]
        ],
        "squat": [
          [
            10,
            1.15
          ],
          [
            25,
            1.55
          ],
          [
            50,
            2.0
          ],
          [
            75,
            2.4
          ],
          [
            90,
            2.78
          ],
          [
            99,
            3.3
          ]
        ],
        "deadlift": [
          [
            10,
            1.45
          ],
          [
            25,
            1.9
          ],
          [
            50,
            2.4
          ],
          [
            75,
            2.8
          ],
          [
            90,
            3.2
          ],
          [
            99,
            3.75
          ]
        ]
      },
      "40-49": {
        "bench": [
          [
            10,
            0.7
          ],
          [
            25,
            0.95
          ],
          [
            50,
            1.25
          ],
          [
            75,
            1.55
          ],
          [
            90,
            1.8
          ],
          [
            99,
            2.15
          ]
        ],
        "squat": [
          [
            10,
            1.05
          ],
          [
            25,
            1.4
          ],
          [
            50,
            1.85
          ],
          [
            75,
            2.25
          ],
          [
            90,
            2.6
          ],
          [
            99,
            3.1
          ]
        ],
        "deadlift": [
          [
            10,
            1.3
          ],
          [
            25,
            1.75
          ],
          [
            50,
            2.2
          ],
          [
            75,
            2.6
          ],
          [
            90,
            3.0
          ],
          [
            99,
            3.5
          ]
        ]
      },
      "50-59": {
        "bench": [
          [
            10,
            0.6
          ],
          [
            25,
            0.85
          ],
          [
            50,
            1.15
          ],
          [
            75,
            1.4
          ],
          [
            90,
            1.65
          ],
          [
            99,
            2.0
          ]
        ],
        "squat": [
          [
            10,
            0.95
          ],
          [
            25,
            1.3
          ],
          [
            50,
            1.7
          ],
          [
            75,
            2.05
          ],
          [
            90,
            2.4
          ],
          [
            99,
            2.85
          ]
        ],
        "deadlift": [
          [
            10,
            1.15
          ],
          [
            25,
            1.55
          ],
          [
            50,
            2.0
          ],
          [
            75,
            2.4
          ],
          [
            90,
            2.75
          ],
          [
            99,
            3.2
          ]
        ]
      },
      "60+": {
        "bench": [
          [
            10,
            0.5
          ],
          [
            25,
            0.7
          ],
          [
            50,
            1.0
          ],
          [
            75,
            1.25
          ],
          [
            90,
            1.5
          ],
          [
            99,
            1.85
          ]
        ],
        "squat": [
          [
            10,
            0.8
          ],
          [
            25,
            1.1
          ],
          [
            50,
            1.5
          ],
          [
            75,
            1.85
          ],
          [
            90,
            2.15
          ],
          [
            99,
            2.55
          ]
        ],
        "deadlift": [
          [
            10,
            1.0
          ],
          [
            25,
            1.35
          ],
          [
            50,
            1.75
          ],
          [
            75,
            2.1
          ],
          [
            90,
            2.45
          ],
          [
            99,
            2.9
          ]
        ]
      }
    },
    "female": {
      "18-23": {
        "bench": [
          [
            10,
            0.5
          ],
          [
            25,
            0.7
          ],
          [
            50,
            0.95
          ],
          [
            75,
            1.15
          ],
          [
            90,
            1.35
          ],
          [
            99,
            1.65
          ]
        ],
        "squat": [
          [
            10,
            0.8
          ],
          [
            25,
            1.15
          ],
          [
            50,
            1.55
          ],
          [
            75,
            1.9
          ],
          [
            90,
            2.26
          ],
          [
            99,
            2.75
          ]
        ],
        "deadlift": [
          [
            10,
            1.05
          ],
          [
            25,
            1.45
          ],
          [
            50,
            1.95
          ],
          [
            75,
            2.3
          ],
          [
            90,
            2.66
          ],
          [
            99,
            3.2
          ]
        ]
      },
      "24-39": {
        "bench": [
          [
            10,
            0.48
          ],
          [
            25,
            0.68
          ],
          [
            50,
            0.92
          ],
          [
            75,
            1.12
          ],
          [
            90,
            1.32
          ],
          [
            99,
            1.6
          ]
        ],
        "squat": [
          [
            10,
            0.78
          ],
          [
            25,
            1.12
          ],
          [
            50,
            1.52
          ],
          [
            75,
            1.85
          ],
          [
            90,
            2.2
          ],
          [
            99,
            2.65
          ]
        ],
        "deadlift": [
          [
            10,
            1.0
          ],
          [
            25,
            1.4
          ],
          [
            50,
            1.9
          ],
          [
            75,
            2.25
          ],
          [
            90,
            2.6
          ],
          [
            99,
            3.1
          ]
        ]
      },
      "40-49": {
        "bench": [
          [
            10,
            0.42
          ],
          [
            25,
            0.6
          ],
          [
            50,
            0.85
          ],
          [
            75,
            1.05
          ],
          [
            90,
            1.22
          ],
          [
            99,
            1.5
          ]
        ],
        "squat": [
          [
            10,
            0.7
          ],
          [
            25,
            1.0
          ],
          [
            50,
            1.4
          ],
          [
            75,
            1.7
          ],
          [
            90,
            2.0
          ],
          [
            99,
            2.45
          ]
        ],
        "deadlift": [
          [
            10,
            0.9
          ],
          [
            25,
            1.25
          ],
          [
            50,
            1.7
          ],
          [
            75,
            2.05
          ],
          [
            90,
            2.4
          ],
          [
            99,
            2.85
          ]
        ]
      },
      "50-59": {
        "bench": [
          [
            10,
            0.38
          ],
          [
            25,
            0.55
          ],
          [
            50,
            0.78
          ],
          [
            75,
            0.95
          ],
          [
            90,
            1.12
          ],
          [
            99,
            1.4
          ]
        ],
        "squat": [
          [
            10,
            0.62
          ],
          [
            25,
            0.9
          ],
          [
            50,
            1.25
          ],
          [
            75,
            1.55
          ],
          [
            90,
            1.85
          ],
          [
            99,
            2.25
          ]
        ],
        "deadlift": [
          [
            10,
            0.8
          ],
          [
            25,
            1.1
          ],
          [
            50,
            1.55
          ],
          [
            75,
            1.85
          ],
          [
            90,
            2.2
          ],
          [
            99,
            2.65
          ]
        ]
      },
      "60+": {
        "bench": [
          [
            10,
            0.32
          ],
          [
            25,
            0.48
          ],
          [
            50,
            0.7
          ],
          [
            75,
            0.88
          ],
          [
            90,
            1.05
          ],
          [
            99,
            1.3
          ]
        ],
        "squat": [
          [
            10,
            0.55
          ],
          [
            25,
            0.8
          ],
          [
            50,
            1.1
          ],
          [
            75,
            1.4
          ],
          [
            90,
            1.68
          ],
          [
            99,
            2.05
          ]
        ],
        "deadlift": [
          [
            10,
            0.7
          ],
          [
            25,
            1.0
          ],
          [
            50,
            1.4
          ],
          [
            75,
            1.7
          ],
          [
            90,
            2.0
          ],
          [
            99,
            2.45
          ]
        ]
      }
    }
  },
  "run_15mile_seconds": {
    "male": {
      "18-23": [
        [
          10,
          870
        ],
        [
          25,
          795
        ],
        [
          50,
          720
        ],
        [
          75,
          645
        ],
        [
          90,
          570
        ],
        [
          99,
          525
        ]
      ],
      "24-39": [
        [
          10,
          900
        ],
        [
          25,
          825
        ],
        [
          50,
          745
        ],
        [
          75,
          670
        ],
        [
          90,
          600
        ],
        [
          99,
          551
        ]
      ],
      "40-49": [
        [
          10,
          975
        ],
        [
          25,
          885
        ],
        [
          50,
          810
        ],
        [
          75,
          730
        ],
        [
          90,
          650
        ],
        [
          99,
          594
        ]
      ],
      "50-59": [
        [
          10,
          1050
        ],
        [
          25,
          960
        ],
        [
          50,
          880
        ],
        [
          75,
          790
        ],
        [
          90,
          710
        ],
        [
          99,
          650
        ]
      ],
      "60+": [
        [
          10,
          1140
        ],
        [
          25,
          1050
        ],
        [
          50,
          960
        ],
        [
          75,
          870
        ],
        [
          90,
          780
        ],
        [
          99,
          710
        ]
      ]
    },
    "female": {
      "18-23": [
        [
          10,
          1035
        ],
        [
          25,
          950
        ],
        [
          50,
          865
        ],
        [
          75,
          780
        ],
        [
          90,
          710
        ],
        [
          99,
          650
        ]
      ],
      "24-39": [
        [
          10,
          1070
        ],
        [
          25,
          985
        ],
        [
          50,
          890
        ],
        [
          75,
          810
        ],
        [
          90,
          735
        ],
        [
          99,
          673
        ]
      ],
      "40-49": [
        [
          10,
          1140
        ],
        [
          25,
          1045
        ],
        [
          50,
          950
        ],
        [
          75,
          860
        ],
        [
          90,
          780
        ],
        [
          99,
          720
        ]
      ],
      "50-59": [
        [
          10,
          1230
        ],
        [
          25,
          1140
        ],
        [
          50,
          1035
        ],
        [
          75,
          945
        ],
        [
          90,
          860
        ],
        [
          99,
          790
        ]
      ],
      "60+": [
        [
          10,
          1320
        ],
        [
          25,
          1230
        ],
        [
          50,
          1130
        ],
        [
          75,
          1030
        ],
        [
          90,
          940
        ],
        [
          99,
          860
        ]
      ]
    }
  },
  "run_1mile_seconds": {
    "male": {
      "18-23": [
        [
          10,
          540
        ],
        [
          25,
          495
        ],
        [
          50,
          435
        ],
        [
          75,
          390
        ],
        [
          90,
          350
        ],
        [
          99,
          305
        ]
      ],
      "24-39": [
        [
          10,
          555
        ],
        [
          25,
          510
        ],
        [
          50,
          450
        ],
        [
          75,
          405
        ],
        [
          90,
          365
        ],
        [
          99,
          320
        ]
      ],
      "40-49": [
        [
          10,
          585
        ],
        [
          25,
          540
        ],
        [
          50,
          480
        ],
        [
          75,
          435
        ],
        [
          90,
          390
        ],
        [
          99,
          345
        ]
      ],
      "50-59": [
        [
          10,
          630
        ],
        [
          25,
          585
        ],
        [
          50,
          525
        ],
        [
          75,
          470
        ],
        [
          90,
          425
        ],
        [
          99,
          375
        ]
      ],
      "60+": [
        [
          10,
          690
        ],
        [
          25,
          630
        ],
        [
          50,
          570
        ],
        [
          75,
          510
        ],
        [
          90,
          465
        ],
        [
          99,
          410
        ]
      ]
    },
    "female": {
      "18-23": [
        [
          10,
          630
        ],
        [
          25,
          570
        ],
        [
          50,
          510
        ],
        [
          75,
          465
        ],
        [
          90,
          420
        ],
        [
          99,
          370
        ]
      ],
      "24-39": [
        [
          10,
          645
        ],
        [
          25,
          585
        ],
        [
          50,
          525
        ],
        [
          75,
          480
        ],
        [
          90,
          435
        ],
        [
          99,
          385
        ]
      ],
      "40-49": [
        [
          10,
          690
        ],
        [
          25,
          630
        ],
        [
          50,
          570
        ],
        [
          75,
          510
        ],
        [
          90,
          465
        ],
        [
          99,
          410
        ]
      ],
      "50-59": [
        [
          10,
          750
        ],
        [
          25,
          690
        ],
        [
          50,
          615
        ],
        [
          75,
          555
        ],
        [
          90,
          510
        ],
        [
          99,
          450
        ]
      ],
      "60+": [
        [
          10,
          825
        ],
        [
          25,
          750
        ],
        [
          50,
          675
        ],
        [
          75,
          615
        ],
        [
          90,
          555
        ],
        [
          99,
          495
        ]
      ]
    }
  },
  "exercise_map": {
    "Dumbell Bench": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 1.0,
      "is_dumbbell_pair": true
    },
    "Inclince Bench": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.85,
      "is_dumbbell_pair": true
    },
    "Lower Cable Flys (Serise)": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.3,
      "is_dumbbell_pair": false
    },
    "Mid Cable Flys (Serise)": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.3,
      "is_dumbbell_pair": false
    },
    "High Cable Flys (Serise)": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.3,
      "is_dumbbell_pair": false
    },
    "Tricep PushDown (Serise)": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.45,
      "is_dumbbell_pair": false
    },
    "Tricep Overheads (Serise)": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.4,
      "is_dumbbell_pair": false
    },
    "Shoulder Flys": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.18,
      "is_dumbbell_pair": true
    },
    "Shoulder Raises": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.25,
      "is_dumbbell_pair": true
    },
    "Lat Pull Down": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.75,
      "is_dumbbell_pair": false
    },
    "Cable Rows": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.8,
      "is_dumbbell_pair": false
    },
    "Hammer Curls": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.35,
      "is_dumbbell_pair": true
    },
    "Preacher Curls": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.45,
      "is_dumbbell_pair": false
    },
    "Face Pulls": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.4,
      "is_dumbbell_pair": false
    },
    "Alternate Dumbell Curls": {
      "category": "upper_strength",
      "anchor": "bench",
      "effort": 0.35,
      "is_dumbbell_pair": true
    },
    "Leg Press": {
      "category": "lower_strength",
      "anchor": "squat",
      "effort": 2.4,
      "is_dumbbell_pair": false
    },
    "Leg Curls": {
      "category": "lower_strength",
      "anchor": "squat",
      "effort": 0.7,
      "is_dumbbell_pair": false
    },
    "Leg Extension": {
      "category": "lower_strength",
      "anchor": "squat",
      "effort": 0.85,
      "is_dumbbell_pair": false
    },
    "Dumbell Lunge": {
      "category": "lower_strength",
      "anchor": "squat",
      "effort": 0.45,
      "is_dumbbell_pair": true
    },
    "Calf Raises": {
      "category": "lower_strength",
      "anchor": "squat",
      "effort": 0.6,
      "is_dumbbell_pair": false
    },
    "Reverse Crunch": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Russian Twist": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Sit ups": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Bicycles": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Leg Raises": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Flutter Kicks": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Mountain Climbers": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Alternate Hand to Toe": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Crunches": {
      "category": "core",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    },
    "Treadmill": {
      "category": "endurance_speed",
      "anchor": null,
      "effort": null,
      "is_dumbbell_pair": false
    }
  },
  "age_brackets": [
    "18-23",
    "24-39",
    "40-49",
    "50-59",
    "60+"
  ]
}