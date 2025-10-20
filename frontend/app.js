// Global state
let questionCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupForms();
    addQuestion(); // Add first question by default
});

// Navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    // Update buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');

    // Load data if needed
    if (tab === 'packages') {
        loadPackages();
    }
}

// Forms setup
function setupForms() {
    // Package form
    document.getElementById('package-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitPackage();
    });

    // Media form
    document.getElementById('media-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await uploadMedia();
    });
}

// Add question to form
function addQuestion() {
    questionCount++;
    const container = document.getElementById('questions-container');
    
    const questionHtml = `
        <div class="question-card" id="question-${questionCount}">
            <h4>Question ${questionCount}</h4>
            <button type="button" class="btn btn-danger" onclick="removeQuestion(${questionCount})" style="float: right;">Remove</button>
            
            <div class="form-group">
                <label>Question Text*</label>
                <textarea name="question-text-${questionCount}" rows="3" required></textarea>
            </div>

            <div class="form-group">
                <label>Content Type*</label>
                <select name="content-type-${questionCount}" onchange="updateContentFields(${questionCount})" required>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="equation">Equation</option>
                    <option value="table">Table</option>
                    <option value="graph">Graph</option>
                    <option value="mixed">Mixed</option>
                </select>
            </div>

            <div class="content-type-group" id="content-fields-${questionCount}">
                <div class="form-group">
                    <label>Content Text</label>
                    <textarea name="content-text-${questionCount}" rows="2"></textarea>
                </div>
            </div>

            <div class="form-group">
                <label>Difficulty</label>
                <select name="difficulty-${questionCount}">
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>

            <div class="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" name="tags-${questionCount}" placeholder="math, algebra, basic">
            </div>

            <div class="form-group">
                <label>Correct Answer</label>
                <input type="text" name="correct-answer-${questionCount}">
            </div>

            <div class="form-group">
                <label>Explanation</label>
                <textarea name="explanation-${questionCount}" rows="2"></textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHtml);
}

function removeQuestion(id) {
    const element = document.getElementById(`question-${id}`);
    if (element) {
        element.remove();
    }
}

function updateContentFields(questionId) {
    const select = document.querySelector(`select[name="content-type-${questionId}"]`);
    const container = document.getElementById(`content-fields-${questionId}`);
    const contentType = select.value;

    let html = '';

    switch (contentType) {
        case 'text':
            html = `
                <div class="form-group">
                    <label>Content Text</label>
                    <textarea name="content-text-${questionId}" rows="2"></textarea>
                </div>
            `;
            break;
        case 'image':
            html = `
                <div class="form-group">
                    <label>Image ID (upload media first)</label>
                    <input type="number" name="content-image-${questionId}">
                </div>
            `;
            break;
        case 'equation':
            html = `
                <div class="form-group">
                    <label>Equation (LaTeX format)</label>
                    <textarea name="content-equation-${questionId}" rows="2" placeholder="x^2 + y^2 = r^2"></textarea>
                </div>
            `;
            break;
        case 'table':
            html = `
                <div class="form-group">
                    <label>Table Headers (JSON array)</label>
                    <textarea name="content-table-headers-${questionId}" rows="2" placeholder='["Column 1", "Column 2"]'></textarea>
                </div>
                <div class="form-group">
                    <label>Table Rows (JSON array of arrays)</label>
                    <textarea name="content-table-rows-${questionId}" rows="3" placeholder='[["Row1Col1", "Row1Col2"], ["Row2Col1", "Row2Col2"]]'></textarea>
                </div>
            `;
            break;
        case 'graph':
            html = `
                <div class="form-group">
                    <label>Graph Type</label>
                    <select name="content-graph-type-${questionId}">
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="pie">Pie</option>
                        <option value="scatter">Scatter</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Labels (JSON array)</label>
                    <textarea name="content-graph-labels-${questionId}" rows="2" placeholder='["Jan", "Feb", "Mar"]'></textarea>
                </div>
                <div class="form-group">
                    <label>Datasets (JSON array)</label>
                    <textarea name="content-graph-datasets-${questionId}" rows="4" placeholder='[{"label": "Sales", "data": [10, 20, 30]}]'></textarea>
                </div>
            `;
            break;
        case 'mixed':
            html = `
                <div class="form-group">
                    <label>Mixed Content (JSON array)</label>
                    <textarea name="content-mixed-${questionId}" rows="4" placeholder='[{"type": "text", "content": "Some text"}, {"type": "equation", "content": "x^2"}]'></textarea>
                </div>
            `;
            break;
    }

    container.innerHTML = html;
}

// Submit package
async function submitPackage() {
    try {
        const title = document.getElementById('package-title').value;
        const description = document.getElementById('package-description').value;
        
        const questions = [];
        const questionCards = document.querySelectorAll('.question-card');

        for (const card of questionCards) {
            const id = card.id.split('-')[1];
            const text = document.querySelector(`textarea[name="question-text-${id}"]`).value;
            const contentType = document.querySelector(`select[name="content-type-${id}"]`).value;
            const difficulty = document.querySelector(`select[name="difficulty-${id}"]`).value;
            const tagsInput = document.querySelector(`input[name="tags-${id}"]`).value;
            const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
            const correctAnswer = document.querySelector(`input[name="correct-answer-${id}"]`).value;
            const explanation = document.querySelector(`textarea[name="explanation-${id}"]`).value;

            // Build content based on type
            const content = { type: contentType };

            switch (contentType) {
                case 'text':
                    const textContent = document.querySelector(`textarea[name="content-text-${id}"]`)?.value;
                    content.text = textContent || '';
                    break;
                case 'image':
                    const imageId = document.querySelector(`input[name="content-image-${id}"]`)?.value;
                    content.imageId = imageId ? parseInt(imageId) : null;
                    break;
                case 'equation':
                    const equation = document.querySelector(`textarea[name="content-equation-${id}"]`)?.value;
                    content.equation = equation || '';
                    break;
                case 'table':
                    const headers = document.querySelector(`textarea[name="content-table-headers-${id}"]`)?.value;
                    const rows = document.querySelector(`textarea[name="content-table-rows-${id}"]`)?.value;
                    content.tableData = {
                        headers: headers ? JSON.parse(headers) : [],
                        rows: rows ? JSON.parse(rows) : []
                    };
                    break;
                case 'graph':
                    const graphType = document.querySelector(`select[name="content-graph-type-${id}"]`)?.value;
                    const labels = document.querySelector(`textarea[name="content-graph-labels-${id}"]`)?.value;
                    const datasets = document.querySelector(`textarea[name="content-graph-datasets-${id}"]`)?.value;
                    content.graphData = {
                        type: graphType,
                        labels: labels ? JSON.parse(labels) : [],
                        datasets: datasets ? JSON.parse(datasets) : []
                    };
                    break;
                case 'mixed':
                    const mixed = document.querySelector(`textarea[name="content-mixed-${id}"]`)?.value;
                    content.mixedContent = mixed ? JSON.parse(mixed) : [];
                    break;
            }

            questions.push({
                text,
                contentType,
                content,
                difficulty: difficulty || undefined,
                tags: tags.length > 0 ? tags : undefined,
                correctAnswer: correctAnswer || undefined,
                explanation: explanation || undefined,
            });
        }

        const data = { title, description, questions };
        const result = await API.createQuestionPackage(data);
        
        showToast('Package created successfully!', 'success');
        document.getElementById('package-form').reset();
        document.getElementById('questions-container').innerHTML = '';
        questionCount = 0;
        addQuestion();
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Upload media
async function uploadMedia() {
    try {
        const fileInput = document.getElementById('media-file');
        const questionId = document.getElementById('media-question-id').value;
        
        if (!fileInput.files[0]) {
            throw new Error('Please select a file');
        }

        const result = await API.uploadMedia(fileInput.files[0], questionId || null);
        
        showToast('Media uploaded successfully!', 'success');
        document.getElementById('media-result').innerHTML = `
            <div class="package-card">
                <h3>Uploaded Media</h3>
                <p><strong>ID:</strong> ${result.data.id}</p>
                <p><strong>Filename:</strong> ${result.data.originalName}</p>
                <p><strong>Type:</strong> ${result.data.mediaType}</p>
                <p><strong>Size:</strong> ${(result.data.size / 1024).toFixed(2)} KB</p>
                ${result.data.mediaType === 'image' ? `<img src="/uploads/${result.data.filename}" alt="Uploaded" style="max-width: 300px; margin-top: 10px;">` : ''}
            </div>
        `;
        
        fileInput.value = '';
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Load packages
async function loadPackages() {
    try {
        const container = document.getElementById('packages-list');
        container.innerHTML = '<div class="loading">Loading packages...</div>';

        const result = await API.getQuestionPackages();
        const packages = result.data;

        if (packages.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No packages yet</h3><p>Create your first question package!</p></div>';
            return;
        }

        container.innerHTML = packages.map(pkg => `
            <div class="package-card">
                <h3>${pkg.title}</h3>
                <p>${pkg.description || 'No description'}</p>
                <p><strong>Questions:</strong> ${pkg.questions?.length || 0}</p>
                <p><strong>Created:</strong> ${new Date(pkg.createdAt).toLocaleDateString()}</p>
                <button class="btn btn-secondary" onclick="viewPackageDetails(${pkg.id})">View Details</button>
                <button class="btn btn-danger" onclick="deletePackage(${pkg.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        document.getElementById('packages-list').innerHTML = '<div class="empty-state"><h3>Error loading packages</h3></div>';
    }
}

async function viewPackageDetails(id) {
    try {
        const result = await API.getQuestionPackageById(id);
        const pkg = result.data;

        const detailsHtml = `
            <div class="package-card">
                <h3>${pkg.title}</h3>
                <p>${pkg.description || 'No description'}</p>
                <h4>Questions:</h4>
                ${pkg.questions.map((q, index) => `
                    <div class="question-item">
                        <strong>Q${index + 1}:</strong> ${q.text}<br>
                        <small><strong>Type:</strong> ${q.contentType} | <strong>Difficulty:</strong> ${q.difficulty || 'N/A'}</small>
                    </div>
                `).join('')}
            </div>
        `;

        const container = document.getElementById('packages-list');
        container.innerHTML = detailsHtml + '<button class="btn btn-secondary" onclick="loadPackages()">Back to List</button>';
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function deletePackage(id) {
    if (!confirm('Are you sure you want to delete this package?')) {
        return;
    }

    try {
        await API.deleteQuestionPackage(id);
        showToast('Package deleted successfully!', 'success');
        loadPackages();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
