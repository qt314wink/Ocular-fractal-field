# Canonical Units

Public numeric fields use the following suffixes and meanings.

| Suffix or term | Meaning                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| `Sec`          | Seconds in simulation time.                                                    |
| `Ms`           | Milliseconds, used only where the contract explicitly requires them.           |
| `tick`         | Integer index in the canonical fixed-step sequence.                            |
| `Rad`          | Radians for canonical angular values.                                          |
| `Deg`          | Degrees for display or authored readability only, never canonical integration. |
| `Normalized`   | Dimensionless value bounded to `[0,1]`, unless a narrower bound is stated.     |
| `Units`        | Authored world-space units.                                                    |
| `Hz`           | Cycles or samples per second.                                                  |
| `Bytes`        | Integer byte count.                                                            |

Viewport positions are normalized before entering canonical packages. Raw pixels, browser timestamps, and device-event objects are not canonical units.
