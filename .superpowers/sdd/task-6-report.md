Status: completed.
Commits: `feat(monitor): status chip detail entry and exception drawer wiring`.
Implemented: status chips now show occupy tooltip, fault/offline `详情 >`, green active border/check badge, and drawer wiring via `ExceptionLogDrawer.open(stationId, type)`.
Implemented: drawer hint copy updated to `由于设备状态会实时变化，若获取最新数据，请点击 刷新`.
Verification: direct Jest focused spec passed; forced ESLint had no errors.
Concerns: forced ESLint still reports existing `stationMonitor.vue` template-indent warnings; browser manual checks were not run.
Report path: `.superpowers/sdd/task-6-report.md`.
