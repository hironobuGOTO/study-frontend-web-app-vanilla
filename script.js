let taskListElem; // どこからでも読み書きできるように外側に変数を移動

// タスクの連想配列の配列
let tasks = [];

window.addEventListener("load", function () {
  // リストを取得
  taskListElem = document.querySelector("ul");

  // LocalStorage から配列を読み込む
  loadTasks();
  // 配列からリストを出力
  renderTasks();
});

function renderTasks() {
  // リストの中身を掃除
  taskListElem.innerHTML = "";

  // 完了済みタスクの件数を数えるための変数を初期化
  let numOfCompletedTasks = 0;

  // 配列を反復
  for (let task of tasks) {
    //リストの項目を作成
    let taskElem = document.createElement("li");
    taskElem.innerText = task.name;

    // 項目をクリックまたはダブルクリックされたときの動作を設定
    taskElem.addEventListener("click", function () {
      // リストの項目をクリックされたときは、タスクの完了状態をトグル
      toggleTaskComplete(task.name);
    });
    taskElem.addEventListener("dblclick", function () {
      // リストの項目をダブルクリックされたときは、タスクを削除
      deleteTask(task.name);
    });

    // タスクの完了状況に応じ、項目の取り消し線を設定
    if (task.isCompleted) {
      taskElem.style.textDecorationLine = "line-through";
      numOfCompletedTasks++;
    } else {
      taskElem.style.textDecorationLine = "none";
    }

    // 期限表示を作成
    let taskDueDateElem = document.createElement("span");
    taskDueDateElem.style.fontSize = "0.8rem";
    taskDueDateElem.style.fontStyle = "italic";
    taskDueDateElem.style.marginLeft = "1rem";

    // 今日の日付を比較しやすいように整える
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    // タスクの日付を比較しやすいように整える
    let taskDate = new Date(task.dueDate + " 00:00:00");

    if (today < taskDate) {
      taskDueDateElem.style.color = "#2c3e50";
    } else if (today.getTime() == taskDate.getTime()) {
      taskDueDateElem.style.color = "#f39c12";
    } else {
      taskDueDateElem.style.color = "#c0392b";
    }

    if (task.dueDate) {
      taskDueDateElem.innerText = task.dueDate;
    } else {
      taskDueDateElem.innerText = "";
    }

    // タスクの残り日数表示機能
    let tasklastDateElem = document.createElement("span");
    let compareTime = taskDate.getTime() - today.getTime();
    let taskLastDate = Math.floor(compareTime / (1000 * 60 * 60 * 24));
    tasklastDateElem.innerText = taskLastDate;
    tasklastDateElem.style.fontStyle = "italic";
    tasklastDateElem.style.marginLeft = "1rem";

    if (!task.dueDate) {
      tasklastDateElem.innerText = "";
    }

    // タスクを一つ上に並び替えるボタン
    let taskUpElem = document.createElement("button");
    taskUpElem.innerText = "↑";
    taskUpElem.style.marginLeft = "1rem";

    // タスクを一つ下に並べ替えるボタン
    let taskDownElem = document.createElement("button");
    taskDownElem.innerText = "↓";
    taskDownElem.style.marginLeft = "0.5rem";

    // 項目に対し、期限表示を追加
    taskElem.appendChild(taskDueDateElem);

    // 項目に対し、タスクの残り日数表示を追加
    taskElem.appendChild(tasklastDateElem);

    // リストに対し、項目を追加
    taskListElem.appendChild(taskElem);

    // 項目の左にタスクを一つ上に並び替えるボタンを追加
    taskElem.appendChild(taskUpElem);

    taskUpElem.addEventListener("click", function () {
      taskUp(tasks.indexOf(task));
      toggleTaskComplete(task.name);
    });

    // 項目の左にタスクを一つ下に並び替えるボタンを追加
    taskElem.appendChild(taskDownElem);

    taskDownElem.addEventListener("click", function () {
      taskDown(tasks.indexOf(task));
      toggleTaskComplete(task.name);
    });
  }
  // 全タスクの件数を更新
  let numOfTasksElem = document.querySelector("#numOfTasks");
  numOfTasksElem.innerText = tasks.length;

  //完了済みタスクの件数を更新
  let numOfCompletedTasksElem = document.querySelector("#numOfCompletedTasks");
  numOfCompletedTasksElem.innerText = numOfCompletedTasks;
}

function addTask(taskName, taskDueDate) {
  //同名のタスクがある場合アラートを出して終了
  if (checkTaskSameNameExists(taskName)) {
    alert("すでに同名のタスクがあります！");
    return;
  }
  // 配列に対し、項目を追加
  tasks.push({
    name: taskName,
    dueDate: taskDueDate,
    isCompleted: false,
  });
  // LocalStrage へ配列を保存
  saveTasks();
  // 配列からリストを再出力
  renderTasks();
  document.querySelector("#inputform").reset();
}

function deleteTask(taskName) {
  // 新しい配列を用意
  let newTasks = [];
  // 現状の配列を反復
  for (let task of tasks) {
    if (task.name != taskName) {
      // 削除したいタスク名でなければ、新しい配列へ追加
      newTasks.push(task);
    }
  }
  // 現状の配列を新しい配列で上書き
  tasks = newTasks;

  // LocalStorage へ配列を保存
  saveTasks();
  // 配列からリストを再出力
  renderTasks();
}

function toggleTaskComplete(taskName) {
  for (let task of tasks) {
    if (task.name == taskName) {
      // 対象のタスク名ならば、完了状態をトグル
      task.isCompleted = !task.isCompleted;
    }
  }

  // LocalStorage へ配列を保存
  saveTasks();
  // 配列からリストを再出力
  renderTasks();
}

function loadTasks() {
  let jsonString = window.localStorage.getItem("tasks");
  if (jsonString) {
    tasks = JSON.parse(jsonString);
  }
}

function saveTasks() {
  let jsonString = JSON.stringify(tasks);
  window.localStorage.setItem("tasks", jsonString);
}

function checkTaskSameNameExists(taskName) {
  for (let task of tasks) {
    if (task.name == taskName) {
      return true;
    }
  }
  return false;
}

function taskUp(indexOfTask) {
  tasks.splice(indexOfTask - 1, 2, tasks[indexOfTask], tasks[indexOfTask - 1]);
}

function taskDown(indexOfTask) {
  tasks.splice(indexOfTask, 2, tasks[indexOfTask + 1], tasks[indexOfTask]);
}
