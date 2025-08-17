		let availableQuizzes = [];
        let currentQuiz = null;
        let currentQuestionIndex = 0;
        let userAnswers = {};
        let quizTimer = null;
        let timeRemaining = 0;
        let completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');

        // Mobile menu functionality
        function toggleMobileMenu() {
            const hamburgerBtn = document.querySelector('.hamburger-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.mobile-menu-overlay');

            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        }


        // Fetch available quizzes from backend
        async function fetchQuizzes() {
            try {
				console.log("getting ");
                const response = await fetch(`${window.backendURL}/api/quizzes`);
                if (!response.ok) {
                    throw new Error('Failed to fetch quizzes');
                }
                const quizzes = await response.json();
                return quizzes; 
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                return [];
            }
        }


        // Fetch quiz questions from backend
        async function fetchQuizQuestions(quizId) {
            try {
                const response = await fetch(`${window.backendURL}/api/quizzes/${quizId}/questions`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch quiz questions');
                }

                const questions = await response.json();

                return questions;
            } catch (error) {
                console.error('Error fetching quiz questions:', error);
                return [];
            }
        }

        // Render quizzes
        function renderQuizzes(quizzes) {
            const quizGrid = document.getElementById('quiz-grid');
            const noQuizzes = document.getElementById('no-quizzes');

            if (quizzes.length === 0) {
                noQuizzes.style.display = 'block';
                return;
            }

            quizGrid.style.display = 'grid';

            quizGrid.innerHTML = quizzes.map(quiz => `
                <div class="quiz-card ${quiz.isCompleted ? 'completed' : ''}">
                    <div class="quiz-header">
                        <div class="quiz-category">${quiz.category}</div>
                        <div class="quiz-difficulty difficulty-${quiz.difficulty}">${quiz.difficulty.toUpperCase()}</div>
                    </div>
                    
                    <h3 class="quiz-title">${quiz.title}</h3>
                    <p class="quiz-description">${quiz.description}</p>
                    
                    <div class="quiz-meta">
                        <div class="quiz-duration">${Math.floor(quiz.duration / 60)}:${(quiz.duration % 60).toString().padStart(2, '0')}</div>
                        <div class="quiz-questions">${quiz.questionCount} Questions</div>
                    </div>
                    
                    <button 
                        class="start-button" 
                        onclick="startQuizEnhanced(${quiz.id})"
                        ${quiz.isCompleted ? 'disabled' : ''}
                    >
                        ${quiz.isCompleted ? '✓ Completed' : 'Start Quiz'}
                    </button>
                </div>
            `).join('');
        }

        // Start quiz
        async function startQuiz(quizId) {
            const button = event.target;
            button.classList.add('loading');
            button.textContent = 'Loading...';

            try {
                // Find the quiz
                currentQuiz = availableQuizzes.find(quiz => quiz.id === quizId);
                if (!currentQuiz) {
                    throw new Error('Quiz not found');
                }

                // Fetch questions
                const questions = await fetchQuizQuestions(quizId);
                if (questions.length === 0) {
                    throw new Error('No questions available for this quiz');
                }

                currentQuiz.questions = questions;
                currentQuestionIndex = 0;
                userAnswers = {};
                timeRemaining = currentQuiz.duration;

                // Show quiz interface
                document.getElementById('quiz-interface').classList.add('active');
                document.body.style.overflow = 'hidden';

                // Initialize quiz
                updateQuizProgress();
                loadQuestion();
                startTimer();

            } catch (error) {
                console.error('Error starting quiz:', error);
                alert('Failed to start quiz. Please try again.');
            } finally {
                button.classList.remove('loading');
                button.textContent = currentQuiz?.isCompleted ? 'Already Completed' : 'Start Quiz';
            }
        }

        // Update quiz progress
        function updateQuizProgress() {
            document.getElementById('current-question').textContent = currentQuestionIndex + 1;
            document.getElementById('total-questions').textContent = currentQuiz.questions.length;
        }

        // Load current question
        function loadQuestion() {
            const question = currentQuiz.questions[currentQuestionIndex];
            const questionText = document.getElementById('question-text');
            const optionsContainer = document.getElementById('options-container');

            questionText.textContent = question.question;

            optionsContainer.innerHTML = question.options.map((option, index) => `
                <div class="option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" onclick="selectOption(${index})">
                    <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                    <div class="option-text">${option}</div>
                </div>
            `).join('');

            // Update navigation buttons
            const prevButton = document.getElementById('prev-button');
            const nextButton = document.getElementById('next-button');
            const submitButton = document.getElementById('submit-button');

            prevButton.disabled = currentQuestionIndex === 0;
            
            if (currentQuestionIndex === currentQuiz.questions.length - 1) {
                nextButton.style.display = 'none';
                submitButton.style.display = 'inline-block';
            } else {
                nextButton.style.display = 'inline-block';
                submitButton.style.display = 'none';
            }
        }

        // Select option
        function selectOption(optionIndex) {
            userAnswers[currentQuestionIndex] = optionIndex;
            
            // Update UI
            const options = document.querySelectorAll('.option');
            options.forEach((option, index) => {
                option.classList.toggle('selected', index === optionIndex);
            });
        }

        // Navigation functions
        function previousQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                updateQuizProgress();
                loadQuestion();
            }
        }

        function nextQuestion() {
            if (currentQuestionIndex < currentQuiz.questions.length - 1) {
                currentQuestionIndex++;
                updateQuizProgress();
                loadQuestion();
            }
        }

        // Timer functions
        function startTimer() {
            quizTimer = setInterval(updateTimer, 1000);
            updateTimer();
        }

        function updateTimer() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const timerDisplay = document.getElementById('timer-display');
            const timer = document.getElementById('timer');

            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Warning when less than 1 minute
            if (timeRemaining <= 60) {
                timer.classList.add('warning');
            }

            if (timeRemaining <= 0) {
                clearInterval(quizTimer);
                submitQuiz(true); // Auto-submit when time runs out
                return;
            }

            timeRemaining--;
        }

        // Submit quiz
        async function submitQuiz(autoSubmit = false) {
            if (quizTimer) {
                clearInterval(quizTimer);
            }

            if (!autoSubmit) {
                const unanswered = currentQuiz.questions.length - Object.keys(userAnswers).length;
                if (unanswered > 0) {
                    if (!confirm(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`)) {
                        if (!autoSubmit) startTimer(); // Restart timer if user cancels
                        return;
                    }
                }
            }

            try {
                // Calculate score
                let score = 0;
                currentQuiz.questions.forEach((question, index) => {
                    if (userAnswers[index] === question.correctAnswer) {
                        score++;
                    }
                });

                const percentage = Math.round((score / currentQuiz.questions.length) * 100);

                // Submit to backend
                const response = await fetch(`/quizzes/${currentQuiz.id}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add authentication headers as needed
                    },
                    body: JSON.stringify({
                        answers: userAnswers,
                        timeSpent: currentQuiz.duration - timeRemaining,
                        score: score,
                        percentage: percentage
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to submit quiz');
                }

                // Mark quiz as completed
                completedQuizzes.push(currentQuiz.id);
                localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));

                // Show results
                alert(`Quiz completed! Your score: ${score}/${currentQuiz.questions.length} (${percentage}%)`);

                // Close quiz interface
                closeQuizEnhanced();

                // Refresh quiz list
                loadQuizzes();

            } catch (error) {
                console.error('Error submitting quiz:', error);
                alert('Failed to submit quiz. Please try again.');
            }
			
			location.reload(true); // true = force reload from server (some browsers ignore this)
        }

        // Enhanced close quiz with cleanup
        function closeQuizEnhanced() {
            document.getElementById('quiz-interface').classList.remove('active');
            document.body.style.overflow = 'auto';
            
            if (quizTimer) {
                clearInterval(quizTimer);
            }

            currentQuiz = null;
            currentQuestionIndex = 0;
            userAnswers = {};
            timeRemaining = 0;
        }

        // Load quizzes on page load
        async function loadQuizzes() {
            availableQuizzes = await fetchQuizzes();
            renderQuizzes(availableQuizzes);
        }

        
		
		// Handle escape key to close quiz
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentQuiz) {
                if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
                    closeQuizEnhanced();
                }
            }
        });

        // Keyboard navigation for quiz questions
        document.addEventListener('keydown', (e) => {
            if (!currentQuiz) return;

            switch(e.key) {
                case 'ArrowLeft':
                    if (currentQuestionIndex > 0) previousQuestion();
                    break;
                case 'ArrowRight':
                    if (currentQuestionIndex < currentQuiz.questions.length - 1) nextQuestion();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    const optionIndex = parseInt(e.key) - 1;
                    const question = currentQuiz.questions[currentQuestionIndex];
                    if (optionIndex < question.options.length) {
                        selectOption(optionIndex);
                    }
                    break;
                case 'Enter':
                    if (currentQuestionIndex === currentQuiz.questions.length - 1) {
                        submitQuiz();
                    } else {
                        nextQuestion();
                    }
                    break;
            }
        });

        // Prevent accidental page refresh during quiz
        window.addEventListener('beforeunload', (e) => {
            if (currentQuiz) {
                e.preventDefault();
                e.returnValue = 'You have a quiz in progress. Are you sure you want to leave?';
            }
        });

        // Auto-save progress every 30 seconds
        let autoSaveInterval;
        
        function startAutoSave() {
            autoSaveInterval = setInterval(() => {
                if (currentQuiz && Object.keys(userAnswers).length > 0) {
                    localStorage.setItem(`quiz_progress_${currentQuiz.id}`, JSON.stringify({
                        questionIndex: currentQuestionIndex,
                        answers: userAnswers,
                        timeRemaining: timeRemaining,
                        timestamp: Date.now()
                    }));
                }
            }, 30000); // Save every 30 seconds
        }

        function stopAutoSave() {
            if (autoSaveInterval) {
                clearInterval(autoSaveInterval);
                autoSaveInterval = null;
            }
        }

        function clearAutoSave(quizId) {
            localStorage.removeItem(`quiz_progress_${quizId}`);
        }

        // Check for saved progress
        function checkSavedProgress(quizId) {
            const saved = localStorage.getItem(`quiz_progress_${quizId}`);
            if (saved) {
                const progress = JSON.parse(saved);
                const hoursSinceLastSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
                
                // Only restore if less than 1 hour old
                if (hoursSinceLastSave < 1) {
                    return progress;
                } else {
                    clearAutoSave(quizId);
                }
            }
            return null;
        }

        // Enhanced start quiz with progress restoration
        async function startQuizEnhanced(quizId) {
            const button = event.target;
            button.classList.add('loading');
            button.textContent = 'Loading...';

            try {
                // Find the quiz
                currentQuiz = availableQuizzes.find(quiz => quiz.id === quizId);
                if (!currentQuiz) {
                    throw new Error('Quiz not found');
                }

                // Check for saved progress
                const savedProgress = checkSavedProgress(quizId);
                if (savedProgress && confirm('You have saved progress for this quiz. Would you like to continue where you left off?')) {
                    currentQuestionIndex = savedProgress.questionIndex;
                    userAnswers = savedProgress.answers;
                    timeRemaining = savedProgress.timeRemaining;
                } else {
                    currentQuestionIndex = 0;
                    userAnswers = {};
                    timeRemaining = currentQuiz.duration;
                    clearAutoSave(quizId);
                }

                // Fetch questions
                const questions = await fetchQuizQuestions(quizId);
                if (questions.length === 0) {
                    throw new Error('No questions available for this quiz');
                }

                currentQuiz.questions = questions;

                // Show quiz interface
                document.getElementById('quiz-interface').classList.add('active');
                document.body.style.overflow = 'hidden';

                // Initialize quiz
                updateQuizProgress();
                loadQuestion();
                startTimer();
                startAutoSave();

            } catch (error) {
                console.error('Error starting quiz:', error);
                alert('Failed to start quiz. Please try again.');
            } finally {
                button.classList.remove('loading');
                button.textContent = currentQuiz?.isCompleted ? 'Already Completed' : 'Start Quiz';
            }
        }

        // Enhanced close quiz with cleanup
        function closeQuizEnhanced() {
            document.getElementById('quiz-interface').classList.remove('active');
            document.body.style.overflow = 'auto';
            
            if (quizTimer) {
                clearInterval(quizTimer);
            }
            
            stopAutoSave();

            if (currentQuiz) {
                clearAutoSave(currentQuiz.id);
            }

            currentQuiz = null;
            currentQuestionIndex = 0;
            userAnswers = {};
            timeRemaining = 0;
        }

        // Filter quizzes by difficulty or category
        function filterQuizzes(filterType, filterValue) {
            const filteredQuizzes = filterValue === 'all' 
                ? availableQuizzes 
                : availableQuizzes.filter(quiz => quiz[filterType] === filterValue);
            renderQuizzes(filteredQuizzes);
        }

        // Search quizzes
        function searchQuizzes(searchTerm) {
            const filteredQuizzes = availableQuizzes.filter(quiz => 
                quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            renderQuizzes(filteredQuizzes);
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', loadQuizzes);