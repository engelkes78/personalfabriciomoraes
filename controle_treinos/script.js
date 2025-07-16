document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos HTML ---
    const studentCardsContainer = document.getElementById('studentCardsContainer');
    const noStudentsMessage = document.getElementById('noStudentsMessage');
    const studentDetailsSection = document.getElementById('studentDetails');
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    const cyclesBody = document.getElementById('cyclesBody');
    const rmTestsBody = document.getElementById('rmTestsBody');
    const generalNotesInput = document.getElementById('generalNotesInput');
    const saveGeneralNotesBtn = document.getElementById('saveGeneralNotesBtn');

    // Botões e Formulários de Aluno
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentSearchInput = document.getElementById('studentSearchInput');
    const studentFormContainer = document.getElementById('studentFormContainer');
    const studentFormTitle = document.getElementById('studentFormTitle');
    const studentForm = document.getElementById('studentForm');
    const studentIdInput = document.getElementById('studentIdInput');
    const studentNameInput = document.getElementById('studentNameInput');

    // Botões e Formulários de Ciclo
    const addCycleBtn = document.getElementById('addCycleBtn');
    const cycleFormContainer = document.getElementById('cycleFormContainer');
    const cycleFormTitle = document.getElementById('cycleFormTitle');
    const cycleForm = document.getElementById('cycleForm');
    const cycleIdInput = document.getElementById('cycleIdInput');
    const cycleNameInput = document.getElementById('cycleNameInput');
    const cycleStartDateInput = document = document.getElementById('cycleStartDateInput');
    const cycleEndDateInput = document.getElementById('cycleEndDateInput');
    const cycleStatusInput = document.getElementById('cycleStatusInput');
    const cycleObjectiveInput = document.getElementById('cycleObjectiveInput');

    // Botões e Formulários de Teste de 1RM
    const addRmTestBtn = document.getElementById('addRmTestBtn');
    const rmTestFormContainer = document.getElementById('rmTestFormContainer');
    const rmTestFormTitle = document.getElementById('rmTestFormTitle');
    const rmTestForm = document.getElementById('rmTestForm');
    const rmTestIdInput = document.getElementById('rmTestIdInput');
    const rmTestExerciseInput = document.getElementById('rmTestExerciseInput');
    const rmTestDateInput = document.getElementById('rmTestDateInput');
    const rmTestValueInput = document.getElementById('rmTestValueInput');
    const rmTestNotesInput = document.getElementById('rmTestNotesInput');

    // Botões de Cancelar (genéricos)
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.target.closest('.form-container').style.display = 'none';
        });
    });

    // --- Variáveis de Dados e Estado ---
    let studentsData = [];
    let currentStudentId = null;

    // --- Funções Auxiliares ---

    // Função para formatar a data para DD/MM/AA
    const formatDateToDisplay = (dateString) => {
        if (!dateString) return 'N/A';
        const [year, month, day] = dateString.split('-');
        // Pega os dois últimos dígitos do ano
        const shortYear = year.slice(2);
        return `${day}/${month}/${shortYear}`;
    };

    // Calcula a duração entre duas datas em semanas/dias
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        if (start > end) return 'Data de fim inválida';

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            return `${diffDays} dia(s)`;
        } else {
            const diffWeeks = Math.ceil(diffDays / 7);
            return `${diffWeeks} semana(s)`;
        }
    };

    // --- Funções de localStorage ---
    const loadFromLocalStorage = () => {
        const data = localStorage.getItem('trainingControlData');
        if (data) {
            studentsData = JSON.parse(data);
        } else {
            // Dados iniciais de exemplo
            studentsData = [
                {
                    id: Date.now(),
                    name: 'Aluno Exemplo (Edite-me!)',
                    cycles: [
                        { id: Date.now() + 1, name: 'Ciclo 1: Força Base', startDate: '2024-01-01', endDate: '2024-01-28', duration: '4 semanas', status: 'Concluido', objective: 'Desenvolvimento de força máxima.' },
                        { id: Date.now() + 2, name: 'Ciclo 2: Hipertrofia', startDate: '2024-02-05', endDate: '2024-03-05', duration: '4 semanas', status: 'Ativo', objective: 'Aumento de volume muscular.' }
                    ],
                    rmTests: [
                        { id: Date.now() + 3, exercise: 'Supino Reto', date: '2023-12-28', rm: 80, notes: 'Teste inicial.' },
                        { id: Date.now() + 4, exercise: 'Agachamento', date: '2024-02-01', rm: 120, notes: 'Melhora significativa.' }
                    ],
                    generalNotes: 'Aluno dedicado e com bom potencial. Focar na técnica do agachamento.'
                }
            ];
            saveToLocalStorage();
        }
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('trainingControlData', JSON.stringify(studentsData));
    };

    // --- Funções de Renderização da UI ---
    const renderStudentList = (searchTerm = '') => {
        studentCardsContainer.innerHTML = '';
        let filteredStudents = studentsData.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // **NOVA LINHA: Ordena os alunos por nome**
        filteredStudents.sort((a, b) => a.name.localeCompare(b.name));

        if (filteredStudents.length === 0) {
            noStudentsMessage.style.display = 'block';
            noStudentsMessage.textContent = searchTerm ? `Nenhum aluno encontrado para "${searchTerm}".` : 'Nenhum aluno cadastrado. Adicione um novo aluno!';
        } else {
            noStudentsMessage.style.display = 'none';
            filteredStudents.forEach(student => {
                const studentCard = document.createElement('div');
                studentCard.classList.add('student-card');
                studentCard.dataset.studentId = student.id;

                const currentCycle = student.cycles.find(c => c.status === 'Ativo') || student.cycles[student.cycles.length - 1];
                const latestRmTest = student.rmTests.reduce((latest, test) => {
                    return (!latest || new Date(test.date) > new Date(latest.date)) ? test : latest;
                }, null);

                studentCard.innerHTML = `
                    <h3>${student.name}</h3>
                    <p>Ciclo Atual: ${currentCycle ? currentCycle.name : 'N/A'}</p>
                    <p>Último 1RM: ${latestRmTest ? `${latestRmTest.exercise} (${latestRmTest.rm}kg em ${formatDateToDisplay(latestRmTest.date)})` : 'N/A'}</p>
                <div class="card-actions">
                        <button class="view-details-btn">Ver Detalhes</button>
                        <button class="edit-student-btn" data-id="${student.id}">Editar</button>
                        <button class="delete-student-btn" data-id="${student.id}">Excluir</button>
                    </div>
                `;
                studentCardsContainer.appendChild(studentCard);
            });
            attachStudentCardListeners();
        }
    };

    const renderStudentDetails = (studentId) => {
        const student = studentsData.find(s => s.id === studentId);
        if (!student) {
            studentDetailsSection.style.display = 'none';
            return;
        }

        currentStudentId = studentId;
        studentNameDisplay.textContent = `Detalhes do Aluno: ${student.name}`;
        studentDetailsSection.style.display = 'block';
        studentDetailsSection.scrollIntoView({ behavior: 'smooth' });

        // Renderizar Ciclos
        cyclesBody.innerHTML = '';
        if (student.cycles.length === 0) {
            cyclesBody.innerHTML = '<tr><td colspan="7" class="no-data">Nenhum ciclo cadastrado para este aluno.</td></tr>';
        } else {
            // **NOVA LINHA: Opcional, ordenar ciclos por data de início, por exemplo**
            // student.cycles.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            student.cycles.forEach(cycle => {
                const row = `
                    <tr data-cycle-id="${cycle.id}">
                        <td>${cycle.name}</td>
                        <td>${formatDateToDisplay(cycle.startDate)}</td>
                        <td>${formatDateToDisplay(cycle.endDate)}</td>
                        <td>${cycle.duration || 'N/A'}</td>
                        <td>${cycle.status || 'N/A'}</td>
                        <td>${cycle.objective || 'N/A'}</td>
                        <td class="actions">
                            <button class="edit-btn" data-type="cycle" data-id="${cycle.id}">Editar</button>
                            <button class="delete-btn" data-type="cycle" data-id="${cycle.id}">Excluir</button>
                        </td>
                    </tr>
                `;
                cyclesBody.innerHTML += row;
            });
        }

        // Renderizar Testes de 1RM
        rmTestsBody.innerHTML = '';
        if (student.rmTests.length === 0) {
            rmTestsBody.innerHTML = '<tr><td colspan="5" class="no-data">Nenhum teste de 1RM cadastrado para este aluno.</td></tr>';
        } else {
             // **NOVA LINHA: Opcional, ordenar testes por data, por exemplo**
            student.rmTests.sort((a, b) => new Date(b.date) - new Date(a.date)); // Mais recente primeiro
            student.rmTests.forEach(test => {
                const row = `
                    <tr data-test-id="${test.id}">
                        <td>${test.exercise}</td>
                        <td>${formatDateToDisplay(test.date)}</td>
                        <td>${test.rm}</td>
                        <td>${test.notes || 'N/A'}</td>
                        <td class="actions">
                            <button class="edit-btn" data-type="rmTest" data-id="${test.id}">Editar</button>
                            <button class="delete-btn" data-type="rmTest" data-id="${test.id}">Excluir</button>
                        </td>
                    </tr>
                `;
                rmTestsBody.innerHTML += row;
            });
        }

        generalNotesInput.value = student.generalNotes || '';
        attachItemActionListeners();
    };

    // --- Listeners de Eventos Globais ---

    const attachStudentCardListeners = () => {
        document.querySelectorAll('.student-card .view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = parseInt(e.target.closest('.student-card').dataset.studentId);
                renderStudentDetails(studentId);
                hideAllForms();
            });
        });

        document.querySelectorAll('.student-card .edit-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = parseInt(e.target.dataset.id);
                editStudent(studentId);
            });
        });

        document.querySelectorAll('.student-card .delete-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = parseInt(e.target.dataset.id);
                deleteStudent(studentId);
            });
        });
    };

    const attachItemActionListeners = () => {
        document.querySelectorAll('.cycles-table .edit-btn, .rm-tests-table .edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const idToEdit = parseInt(e.target.dataset.id);
                if (type === 'cycle') {
                    editCycle(idToEdit);
                } else if (type === 'rmTest') {
                    editRmTest(idToEdit);
                }
            });
        });

        document.querySelectorAll('.cycles-table .delete-btn, .rm-tests-table .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const idToDelete = parseInt(e.target.dataset.id);
                deleteItem(type, idToDelete);
            });
        });
    };

    // Campo de Busca de Alunos
    studentSearchInput.addEventListener('input', (e) => {
        renderStudentList(e.target.value);
        studentDetailsSection.style.display = 'none';
        currentStudentId = null;
    });

    const hideAllForms = () => {
        studentFormContainer.style.display = 'none';
        cycleFormContainer.style.display = 'none';
        rmTestFormContainer.style.display = 'none';
    };

    // --- Funções de CRUD (Create, Read, Update, Delete) ---

    // Aluno: Adicionar / Editar
    addStudentBtn.addEventListener('click', () => {
        hideAllForms();
        studentFormContainer.style.display = 'block';
        studentFormTitle.textContent = 'Adicionar Novo Aluno';
        studentIdInput.value = '';
        studentNameInput.value = '';
    });

    const editStudent = (id) => {
        hideAllForms();
        const student = studentsData.find(s => s.id === id);
        if (student) {
            studentFormContainer.style.display = 'block';
            studentFormTitle.textContent = `Editar Aluno: ${student.name}`;
            studentIdInput.value = student.id;
            studentNameInput.value = student.name;
        }
    };

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = studentIdInput.value ? parseInt(studentIdInput.value) : null;
        const newStudentName = studentNameInput.value.trim();

        if (!newStudentName) {
            alert('Por favor, insira o nome do aluno.');
            return;
        }

        if (id) {
            const studentIndex = studentsData.findIndex(s => s.id === id);
            if (studentIndex !== -1) {
                studentsData[studentIndex].name = newStudentName;
                if (currentStudentId === id) {
                     studentNameDisplay.textContent = `Detalhes do Aluno: ${newStudentName}`;
                }
                alert('Aluno atualizado com sucesso!');
            }
        } else {
            const newStudent = {
                id: Date.now(),
                name: newStudentName,
                cycles: [],
                rmTests: [],
                generalNotes: ''
            };
            studentsData.push(newStudent);
            alert('Aluno adicionado com sucesso!');
        }
        saveToLocalStorage();
        renderStudentList(); // Re-renderiza a lista para aplicar a ordenação
        hideAllForms();
    });

    const deleteStudent = (id) => {
        if (confirm('Tem certeza que deseja EXCLUIR este aluno e TODOS os seus dados de treino? Esta ação é irreversível.')) {
            studentsData = studentsData.filter(s => s.id !== id);
            saveToLocalStorage();
            renderStudentList(); // Re-renderiza a lista para refletir a exclusão
            if (currentStudentId === id) {
                studentDetailsSection.style.display = 'none';
                currentStudentId = null;
            }
            alert('Aluno excluído com sucesso.');
        }
    };

    // Ciclo: Adicionar / Editar
    addCycleBtn.addEventListener('click', () => {
        if (!currentStudentId) {
            alert('Por favor, selecione um aluno primeiro.');
            return;
        }
        hideAllForms();
        cycleFormContainer.style.display = 'block';
        cycleFormTitle.textContent = 'Adicionar Novo Ciclo';
        cycleIdInput.value = '';
        cycleNameInput.value = '';
        cycleStartDateInput.value = '';
        cycleEndDateInput.value = '';
        cycleStatusInput.value = 'Ativo';
        cycleObjectiveInput.value = '';
    });

    const editCycle = (id) => {
        hideAllForms();
        const student = studentsData.find(s => s.id === currentStudentId);
        if (!student) return;
        const cycle = student.cycles.find(c => c.id === id);

        if (cycle) {
            cycleFormContainer.style.display = 'block';
            cycleFormTitle.textContent = `Editar Ciclo: ${cycle.name}`;
            cycleIdInput.value = cycle.id;
            cycleNameInput.value = cycle.name;
            cycleStartDateInput.value = cycle.startDate;
            cycleEndDateInput.value = cycle.endDate;
            cycleStatusInput.value = cycle.status;
            cycleObjectiveInput.value = cycle.objective;
        }
    };

    cycleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const student = studentsData.find(s => s.id === currentStudentId);
        if (!student) return;

        const id = cycleIdInput.value ? parseInt(cycleIdInput.value) : null;
        const name = cycleNameInput.value.trim();
        const startDate = cycleStartDateInput.value;
        const endDate = cycleEndDateInput.value;
        const status = cycleStatusInput.value;
        const objective = cycleObjectiveInput.value.trim();

        if (!name || !startDate) {
            alert('Por favor, preencha o nome e a data de início do ciclo.');
            return;
        }
        if (startDate && endDate && new Date(startDate + 'T00:00:00') > new Date(endDate + 'T00:00:00')) {
            alert('A data de fim não pode ser anterior à data de início.');
            return;
        }

        const duration = calculateDuration(startDate, endDate);

        if (id) {
            const cycleIndex = student.cycles.findIndex(c => c.id === id);
            if (cycleIndex !== -1) {
                student.cycles[cycleIndex] = { ...student.cycles[cycleIndex], name, startDate, endDate, duration, status, objective };
                alert('Ciclo atualizado com sucesso!');
            }
        } else {
            const newCycle = { id: Date.now(), name, startDate, endDate, duration, status, objective };
            student.cycles.push(newCycle);
            alert('Ciclo adicionado com sucesso!');
        }
        saveToLocalStorage();
        renderStudentDetails(currentStudentId);
        renderStudentList(); // Re-renderiza a lista de alunos (para atualizar dados dos cards)
        hideAllForms();
    });

    // Teste de 1RM: Adicionar / Editar
    addRmTestBtn.addEventListener('click', () => {
        if (!currentStudentId) {
            alert('Por favor, selecione um aluno primeiro.');
            return;
        }
        hideAllForms();
        rmTestFormContainer.style.display = 'block';
        rmTestFormTitle.textContent = 'Adicionar Novo Teste de 1RM';
        rmTestIdInput.value = '';
        rmTestExerciseInput.value = '';
        rmTestDateInput.value = '';
        rmTestValueInput.value = '';
        rmTestNotesInput.value = '';
    });

    const editRmTest = (id) => {
        hideAllForms();
        const student = studentsData.find(s => s.id === currentStudentId);
        if (!student) return;
        const rmTest = student.rmTests.find(t => t.id === id);

        if (rmTest) {
            rmTestFormContainer.style.display = 'block';
            rmTestFormTitle.textContent = `Editar Teste de 1RM: ${rmTest.exercise}`;
            rmTestIdInput.value = rmTest.id;
            rmTestExerciseInput.value = rmTest.exercise;
            rmTestDateInput.value = rmTest.date;
            rmTestValueInput.value = rmTest.rm;
            rmTestNotesInput.value = rmTest.notes;
        }
    };

    rmTestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const student = studentsData.find(s => s.id === currentStudentId);
        if (!student) return;

        const id = rmTestIdInput.value ? parseInt(rmTestIdInput.value) : null;
        const exercise = rmTestExerciseInput.value.trim();
        const date = rmTestDateInput.value;
        const rm = parseFloat(rmTestValueInput.value);
        const notes = rmTestNotesInput.value.trim();

        if (!exercise || !date || isNaN(rm)) {
            alert('Por favor, preencha todos os campos obrigatórios: Exercício, Data e 1RM.');
            return;
        }
        if (rm <= 0) {
            alert('O valor de 1RM deve ser maior que zero.');
            return;
        }

        if (id) {
            const testIndex = student.rmTests.findIndex(t => t.id === id);
            if (testIndex !== -1) {
                student.rmTests[testIndex] = { ...student.rmTests[testIndex], exercise, date, rm, notes };
                alert('Teste de 1RM atualizado com sucesso!');
            }
        } else {
            const newRmTest = { id: Date.now(), exercise, date, rm, notes };
            student.rmTests.push(newRmTest);
            alert('Teste de 1RM adicionado com sucesso!');
        }
        saveToLocalStorage();
        renderStudentDetails(currentStudentId);
        renderStudentList(); // Re-renderiza a lista de alunos (para atualizar dados dos cards)
        hideAllForms();
    });

    // Função genérica de Exclusão (Ciclos e Testes de 1RM)
    const deleteItem = (type, id) => {
        const student = studentsData.find(s => s.id === currentStudentId);
        if (!student) return;

        const confirmationMsg = `Tem certeza que deseja excluir este ${type === 'cycle' ? 'ciclo' : 'teste de 1RM'}? Esta ação é irreversível.`;
        if (confirm(confirmationMsg)) {
            if (type === 'cycle') {
                student.cycles = student.cycles.filter(item => item.id !== id);
            } else if (type === 'rmTest') {
                student.rmTests = student.rmTests.filter(item => item.id !== id);
            }
            saveToLocalStorage();
            renderStudentDetails(currentStudentId);
            renderStudentList(); // Re-renderiza a lista de alunos (para atualizar dados dos cards)
            alert(`${type === 'cycle' ? 'Ciclo' : 'Teste de 1RM'} excluído com sucesso.`);
        }
    };

    // Salvar Observações Gerais
    saveGeneralNotesBtn.addEventListener('click', () => {
        if (!currentStudentId) {
            alert('Por favor, selecione um aluno primeiro.');
            return;
        }
        const student = studentsData.find(s => s.id === currentStudentId);
        if (student) {
            student.generalNotes = generalNotesInput.value.trim();
            saveToLocalStorage();
            alert('Observações gerais salvas com sucesso!');
        }
    });

    // --- Inicialização ---
    loadFromLocalStorage();
    renderStudentList(); // Renderiza a lista inicial já ordenada
});