-- Removes the throwaway table from 0004 now that task 6's shared
-- optimistic-mutation + Realtime pattern has been proven end-to-end.
alter publication supabase_realtime drop table realtime_smoke_test;
drop table realtime_smoke_test;
