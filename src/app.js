BX24.init(function () {
	loadUsers();

	let username, // имя пользователя
		userId, // ID пользователя
		dateFromValue, // дата начала
		dateToValue, // дата конца
		tasks = [], // массив с задачами
		totalTasks, // количество задач
		users = document.querySelector("#users"), // select пользователей
		dateFrom = document.querySelector("#date-from"), // date начала
		dateTo = document.querySelector("#date-to"), // date конца
		loadButton = document.querySelector("#button-load"), // кнопка загрузки
		content = document.querySelector("#content"); // вывод таблицы

	// обработчик событий
	function listener(element, event, func) {
		element.addEventListener(event, func);
	}

	function usersFunc() {
		userId = this.value;
		searchUser(this.value);
	}

	// поиск пользователя по ID
	function searchUser(id) {
		BX24.callMethod("user.search", {}, function (data) {
			let users = data.data();
			for (let user of users) {
				if (user.ID == id) {
					username = `${user.NAME} ${user.LAST_NAME}`;
					break;
				}
			}
		});
	}
	/* NOTE
					searchUser можно убрать чтобы использовать меньше строк кода, но для читабельности лучше оставить
				*/

	// Получение начала периода
	function dateFromFunc() {
		dateFromValue = `${this.value}T00:00:00`;
	}

	// Получение конца периода
	function dateToFunc() {
		dateToValue = `${this.value}T00:00:00`;
	}

	// Загрузка всех задач
	function loadTasksFunc() {
		BX24.callMethod(
			"tasks.task.list",
			{
				filter: { "RESPONSIBLE_ID": userId, ">=CREATED_DATE": dateFromValue, "<=CLOSED_DATE": dateToValue },
				select: ["ID", "TITLE", "CREATED_DATE", "CLOSED_DATE"],
			},
			function (data) {
				let total = data.total(),
					res = data.answer.result;
				totalTasks = total;
				console.log(data);

				if (total == 0) {
					tasks.error = "У пользователя не было задач в данном периоде!";
				} else {
					for (let i = 0; i < res.tasks.length; i++) {
						tasks.push({
							title: res.tasks[i].title,
							taskId: res.tasks[i].id,
							createdDate: res.tasks[i].createdDate.slice(0, 10),
							closedDate: res.tasks[i].closedDate.slice(0, 10),
						});
					}
				}

				data.next();
			}
		);
	}

	//Генерация таблицы
	function loadTableFunc() {
		let out = "",
			table;
		console.log(tasks.error);
		if (tasks.error != undefined) {
			out = "<tr><td colspan='0' scope='colgroup'><p>У пользователя не было задач в данном периоде!</p></td></tr>";
		} else {
			for (let i = 0; i < totalTasks; i++) {
				if (i == 0) {
					out += `
									<tr>
										<td height='100%' rowspan="0" scope="rowgroup">${username}</td>
										<td scope="row"><a href="https://adara.bitrix24.ru/company/personal/user/${userId}/tasks/task/view/${tasks[i].taskId}/">${tasks[i].title}</a></td>
										<td scope="row">${tasks[i].createdDate}</td>
										<td scope="row">${tasks[i].closedDate}</td>
										<td height='100%' rowspan="0" scope="rowgroup">${totalTasks}</td>
									</tr>
									`;
				} else {
					out += `
									<tr>
										<td scope="row"><a href="https://adara.bitrix24.ru/company/personal/user/${userId}/tasks/task/view/${tasks[i].taskId}/">${tasks[i].title}</a></td>
										<td scope="row">${tasks[i].createdDate}</td>
										<td scope="row">${tasks[i].closedDate}</td>
									</tr>`;
				}
			}
		}

		table = `
								<table>
									<caption>
										Список задач
									</caption>
									<tr>
										<th scope="col">Пользователь</th>
										<th scope="col">Задачи</th>
										<th scope="col">Дата начала</th>
										<th scope="col">Дата окончания</th>
										<th scope="col">Всего</th>
									</tr>
									${out}
								</table>`;
		tasks = [];
		content.innerHTML = table;
	}

	// Генерация таблицы
	function loadContentFunc() {
		loadTasksFunc();
		setTimeout(() => {
			loadTableFunc();
		}, 1000);
	}

	listener(users, "input", usersFunc);
	listener(dateFrom, "input", dateFromFunc);
	listener(dateTo, "input", dateToFunc);
	listener(loadButton, "click", loadContentFunc);

	// Загрузка пользователей в select
	function loadUsers() {
		BX24.callMethod("user.search", {}, function (data) {
			for (let user of data.data()) {
				users.innerHTML += `<option value="${user.ID}" name="${user.NAME} ${user.LAST_NAME}">${user.NAME} ${user.LAST_NAME}</option>`;
			}
		});
	}
});
