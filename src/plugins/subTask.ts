import type { SubTask } from "~/types/subTask"
import Database from "tauri-plugin-sql-api"

export default defineNuxtPlugin(() => {
  return {
    provide: {
      getSubTasks: async (taskId: number): Promise<SubTask[]> => {
        return new Promise(async (resolve, reject) => {
          const db = await Database.load("sqlite:task_app.db")
          const errorInfo = {
            message: "サブタスクの取得に失敗しました。",
            items: [""]
          }
          try {
            const searchSubTasks: SubTask[] = await db.select(
            "SELECT id, name, is_done FROM sub_tasks WHERE task_id = $1",
            [taskId])

            resolve(searchSubTasks)
          } catch (err) {
            reject(errorInfo)
          }
        })
      },
      registSubTask: async (registSubTaskName: string, taskId: number): Promise<void> => {
        return new Promise(async (resolve, reject) => {
          const db = await Database.load("sqlite:task_app.db")
          const errorInfo = {
            message: "サブタスクの登録に失敗しました。",
            items: [""]
          }

          await db.execute(
            "INSERT INTO sub_tasks (name, task_id) VALUES ($1, $2)",
            [registSubTaskName, taskId]
          ).then(() => {
            resolve()
          }).catch ((err) => {
            reject(errorInfo)
          })
        })
      },
      updateSubTask: async (subTaskId: number, status: boolean): Promise<void> => {
        return new Promise(async (resolve, reject) => {
          const db = await Database.load("sqlite:task_app.db")
          const errorInfo = {
            message: "サブタスクの更新に失敗しました。",
            items: [""]
          }

          await db.execute(
            "UPDATE sub_tasks SET is_done = $1 WHERE id = $2",
            [status, subTaskId]
          ).catch ((err) => {
            reject(errorInfo)
          })
        })
      },
      deleteSubTask: async (subTaskId: number, taskId: number): Promise<SubTask[]> => {
        return new Promise(async (resolve, reject) => {
          const { $getSubTasks } = useNuxtApp()
          const db = await Database.load("sqlite:task_app.db")
          const errorInfo = {
            message: "サブタスクの削除に失敗しました。",
            items: [""]
          }

          await db.select(
            "DELETE FROM sub_tasks WHERE id = $1",
            [subTaskId]
          ).then(async () => {
            await $getSubTasks(taskId).then((result: SubTask[]) => {
              resolve(result)
            }).catch((err) => {
              errorInfo.message = err.message
              reject(errorInfo)
            })
          }).catch(() => {
            reject(errorInfo)
          })
        })
      }
    }
  }
})
