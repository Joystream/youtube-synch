import Queue from 'better-queue'

// Youtube videos download service
export class PriorityQueue<
  Task extends { id: string },
  ProcessingType extends 'batchProcessor' | 'sequentialProcessor'
> {
  private readonly MAX_SUDO_PRIORITY = 100
  private readonly OLDEST_PUBLISHED_DATE = 946684800 // Unix timestamp of year 2000

  private queue: Queue<Task>
  // Queue elements set, it is used to calculate the size of queue since since `BetterQueue.getStats()` does not work correctly
  private taskIds: Set<string>
  private activeTaskIds: Set<string>

  public constructor(
    processingFunc: (
      task: ProcessingType extends 'sequentialProcessor' ? Task : Task[],
      cb: (error?: any, result?: null) => void
    ) => void,
    priority: (task: Task, cb: (error: any, priority: number) => void) => void,
    batchSize?: ProcessingType extends 'batchProcessor' ? number : never
  ) {
    const patchedProcessingFunc = (
      task: ProcessingType extends 'sequentialProcessor' ? Task : Task[],
      cb: (error?: any, result?: null) => void
    ) => {
      // add task to active tasks set
      if (task instanceof Array) {
        task.forEach((t) => this.activeTaskIds.add(t.id))
      } else {
        this.activeTaskIds.add(task.id)
      }

      processingFunc(task, (error, result) => {
        // remove task from both `activeTasks` set & `queueSet`
        if (task instanceof Array) {
          task.forEach((t) => this.taskIds.delete(t.id))
          task.forEach((t) => this.activeTaskIds.delete(t.id))
        } else {
          this.taskIds.delete(task.id)
          this.activeTaskIds.delete(task.id)
        }
        cb(error, result)
      })
    }

    this.taskIds = new Set()
    this.activeTaskIds = new Set()
    this.queue = new Queue(patchedProcessingFunc, {
      priority,
      batchSize,
    })
  }

  public push(task: Task) {
    /**
     * If a new task with ID is added to better-queue and old task with the same ID already exists,
     * by default, the new replaces the previous task. However, this is not true while the old task has
     * started processing when the new task was added, in this case both task will be processed, leading
     * to duplicate processing. To avoid this, new task wont be added if the old task with the same ID
     * is being processed.
     */
    if (!this.activeTaskIds.has(task.id)) {
      this.taskIds.add(task.id)
      return this.queue.push(task)
    }
  }

  public cancel(task: Task) {
    this.taskIds.delete(task.id)
    return this.queue.cancel(task)
  }

  public get stats() {
    return {
      totalTasks: this.taskIds.size,
      activeTasks: this.activeTaskIds.size,
      activeTaskIds: this.activeTaskIds,
    }
  }

  // Measure the priority of a video for download / creation queue.
  private measure(sudoPriority: number, percentage: number, publishedAt: number) {
    const currentUnixTime = Date.now()
    const normalizedPublishedDate =
      (100 * (currentUnixTime - publishedAt)) / (currentUnixTime - this.OLDEST_PUBLISHED_DATE)
    const percentageWeight = 1000
    const sudoPriorityWeight = 2 * percentageWeight

    return sudoPriorityWeight * sudoPriority + percentageWeight * percentage + normalizedPublishedDate
  }

  /**
   * Re/calculates the priority score/rank of a video based on the following parameters:
   * - sudoPriority: a number between 0 and 100, where 0 is the lowest priority and 100 is the highest priority.
   * - percentageOfCreatorBacklogNotSynched: a number between 0 and 100, where 0 is the lowest priority and 100 is the highest priority.
   * - viewsOnYouTube: a number between 0 and 10,000,000, where 0 is the lowest priority and 10,000,000 is the highest priority.
   * @returns a number between 0 and 10,000,000, where 0 is the lowest priority and 10,000,000 is the highest priority.
   */
  public calculateVideoRank(
    sudoPriority: number,
    percentageOfCreatorBacklogNotSynched: number,
    viewsOnYouTube: number
  ) {
    const isIntegerInRange = (value: number, min: number, max: number) => {
      return value >= min && value <= max
    }
    if (!isIntegerInRange(sudoPriority, 0, this.MAX_SUDO_PRIORITY)) {
      throw new Error(
        `Invalid sudoPriority value ${sudoPriority}, should be an integer between 0 and ${this.MAX_SUDO_PRIORITY}`
      )
    } else if (!isIntegerInRange(percentageOfCreatorBacklogNotSynched, 0, 100)) {
      throw new Error(`Invalid percentageOfCreatorBacklogNotSynched value ${percentageOfCreatorBacklogNotSynched}`)
    }

    const rank = Math.ceil(this.measure(sudoPriority, percentageOfCreatorBacklogNotSynched, viewsOnYouTube))

    return rank
  }
}
