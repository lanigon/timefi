# computing process

for the reason that, all numbers should be integers, we can only enlarge the number, by times 100, to get simulated results.

e.g.

Original:

```
program: bkok_eval_math_program
inputs:
  credit_score: 85
  risk_level: 3
  old_base_number: 1000
  old_credit: 10
expected_outputs:
  new_base_number: 1160
  new_credit: 10.5
  new_limit: 1218
```

```
(85 - 60) / 100 * 0.2 = 0.05
10 x (1 + 0.05) = 10.5

(7 - 3) / 5 * 0.2 = 0.16
1000 x (1 + 0.16) = 1160

final: 1160 * 10.5 / 10 = 1218
```

Now:

```
program: bkok_eval_math_program
inputs:
  credit_score: 8500
  risk_level: 300
  old_base_number: 1000
  old_credit: 100
expected_outputs:
  new_base_number: 1160
  new_credit: 105
  new_limit: 1218
```

```
(8500 - 6000) / 500 = 5
100 x (100 + 5) / 100 = 105

(700 - 300) / 25 = 16
1000 x (100 + 16) / 100 = 1160

final: 1160 * 105 / 100 = 1218
```

# Notice

All the inputs:

+ `credit_score`: 1-100 -> 100 - 10000 when computing
+ `risk_level`: 1 - 10 -> 100 - 1000 when computing
+ `old_credit`: 1.0 - 10.0 -> 100 - 1000 when computing
+ `old_base_number`: 1000, normal number
