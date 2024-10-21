const API_KEY = 'AIzaSyDygqjeBBjP1riNosq1pAEMRgvoBnkwUKs'; // API anahtarınız
        const MODEL_NAME = 'gemini-pro';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        const chatMessages = document.getElementById('chatMessages');
        const userInput = document.getElementById('userInput');

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Sayfa yüklendiğinde ayarları yükle
        window.onload = function() {
            loadSettings();
            applyTheme();
            applyFontSize();
            applyAccentColor();
            updateResponseLengthLabel();
        }

        async function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;

            addMessage(message, 'user-message');
            userInput.value = '';

            try {
                const loadingMessage = addMessage('Düşünüyor...', 'ai-message');

                const personality = document.getElementById('aiPersonality').value;
                const responseLength = document.getElementById('responseLength').value;
                const language = document.getElementById('language').value;
                const customInstructions = document.getElementById('customInstructions').value;

                const prompt = `
                    Kişilik: ${personality}
                    Cevap Uzunluğu: ${responseLength}
                    Dil: ${language}
                    Özel Yönergeler: ${customInstructions}
                    Kullanıcı Mesajı: ${message}

                    Lütfen yukarıdaki ayarlara ve özel yönergelere göre cevap verin.
                `;

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                loadingMessage.remove();
                
                if (data.candidates && data.candidates[0].content) {
                    addMessage(data.candidates[0].content.parts[0].text, 'ai-message');
                } else {
                    addMessage('Üzgünüm, isteğinizi işlerken bir hata oluştu.', 'ai-message');
                }
            } catch (error) {
                console.error('Hata:', error);
                const loadingMessage = chatMessages.querySelector('.message:last-child');
                if (loadingMessage && loadingMessage.textContent === 'Düşünüyor...') {
                    loadingMessage.remove();
                }
                addMessage('Üzgünüm, AI servisine bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'ai-message');
            }
        }

        function addMessage(text, className) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${className}`;
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return messageDiv;
        }

        function openSettings() {
            document.getElementById('settingsModal').style.display = 'flex';
        }

        function closeSettings() {
            document.getElementById('settingsModal').style.display = 'none';
        }

        function applyTheme() {
            const theme = document.getElementById('theme').value;
            if (theme === 'dark') {
                document.documentElement.style.setProperty('--background-color', '#333');
                document.documentElement.style.setProperty('--text-color', '#fff');
                document.documentElement.style.setProperty('--message-bg-user', '#4a4a4a');
                document.documentElement.style.setProperty('--message-bg-ai', '#2a2a2a');
            } else {
                document.documentElement.style.setProperty('--background-color', '#f5f5f5');
                document.documentElement.style.setProperty('--text-color', '#333');
                document.documentElement.style.setProperty('--message-bg-user', '#e3f2fd');
                document.documentElement.style.setProperty('--message-bg-ai', '#f5f5f5');
            }
        }

        function applyFontSize() {
            const fontSize = document.getElementById('fontSize').value;
            document.body.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
        }

        function applyAccentColor() {
            const accentColor = document.getElementById('accentColor').value;
            document.documentElement.style.setProperty('--accent-color', accentColor);
        }

        function updateResponseLengthLabel() {
            const value = document.getElementById('responseLength').value;
            const label = document.getElementById('responseLengthLabel');
            const labels = ['Çok Kısa', 'Kısa', 'Orta', 'Uzun', 'Çok Uzun'];
            label.textContent = labels[value - 1];
        }

        function saveSettings() {
            const settings = {
                theme: document.getElementById('theme').value,
                fontSize: document.getElementById('fontSize').value,
                accentColor: document.getElementById('accentColor').value,
                aiPersonality: document.getElementById('aiPersonality').value,
                responseLength: document.getElementById('responseLength').value,
                language: document.getElementById('language').value,
                customInstructions: document.getElementById('customInstructions').value
            };
            localStorage.setItem('aiAssistantSettings', JSON.stringify(settings));
            closeSettings();
        }

        function loadSettings() {
            const savedSettings = localStorage.getItem('aiAssistantSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                document.getElementById('theme').value = settings.theme;
                document.getElementById('fontSize').value = settings.fontSize;
                document.getElementById('accentColor').value = settings.accentColor;
                document.getElementById('aiPersonality').value = settings.aiPersonality;
                document.getElementById('responseLength').value = settings.responseLength;
                document.getElementById('language').value = settings.language;
                document.getElementById('customInstructions').value = settings.customInstructions;
            }
        }