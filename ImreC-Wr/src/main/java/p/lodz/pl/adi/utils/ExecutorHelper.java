package p.lodz.pl.adi.utils;

import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;

public class ExecutorHelper {

    public static final int MESSAGE_LIMIT = 10;
    public static final int PROCESSOR_MULTIPLIER = 5;
    public static final double NEED_MULTIPLIER = 3;

    private final int _processors = Runtime.getRuntime().availableProcessors();
    private final int _executorSlots = _processors * PROCESSOR_MULTIPLIER;
    private final int _capacity = (int) (_executorSlots * NEED_MULTIPLIER);

    private final ThreadPoolExecutor _executor = (ThreadPoolExecutor) Executors.newFixedThreadPool(_executorSlots);

    public long getCompletedTaskCount() {
        return _executor.getCompletedTaskCount();
    }

    public int getNotCompletedCount() {
        int queued = _executor.getQueue().size();
        int active = _executor.getActiveCount();
        return queued + active;
    }

    public int needTasks() {
        int need = _capacity - getNotCompletedCount();
        return Math.min(MESSAGE_LIMIT, need);
    }

    public Future<?> submit(Runnable task) {
        return _executor.submit(task);
    }
}
