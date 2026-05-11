<template>
  <div class="questionnaire" :class="themeClass">
    <!-- Переключатель темы -->
    <div class="theme-switcher">
      <span :class="{ active: !isDarkTheme }">Светлая</span>
      <label class="switch">
        <input type="checkbox" @change="toggleTheme" :checked="isDarkTheme" />
        <span class="slider"></span>
      </label>
      <span :class="{ active: isDarkTheme }">Тёмная</span>
    </div>

    <h1>Анкета здоровья посетителя дельфинотерапии</h1>

    <!-- Блок согласия на обработку персональных данных -->
    <div class="consent-section">
      <span class="required-asterisk outside-asterisk">*</span>
      <div class="consent-container">
        <div class="consent-checkbox">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isConsentGiven" @change="saveToStorage" />
            <span class="checkbox-custom"></span>
            Я даю своё согласие на обработку персональной информации на условиях, представленных
            <button type="button" @click="toggleConsentModal" class="consent-link">здесь</button>
          </label>
        </div>

        <!-- Модальное окно с условиями -->
        <div v-if="isConsentModalVisible" class="consent-modal" @click.self="toggleConsentModal">
          <div class="consent-modal-content">
            <ConsentSection />
            <button type="button" @click="toggleConsentModal" class="close-modal-btn">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Блок персональных данных -->
    <div class="personal-data">
      <h3>Персональные данные</h3>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> ФИО посещаемого:</label>
        <input
          v-model="personalData.fullName"
          @input="saveToStorage"
          type="text"
          placeholder="Введите ФИО"
        />
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Вес (кг):</label>
        <input
          v-model="personalData.weight"
          @input="saveToStorage"
          type="number"
          min="0"
          placeholder="Введите вес"
        />
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Рост (см):</label>
        <input
          v-model="personalData.height"
          @input="saveToStorage"
          type="number"
          min="0"
          placeholder="Введите рост"
        />
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Возраст:</label>
        <input
          v-model="personalData.age"
          @input="saveToStorage"
          type="number"
          min="0"
          placeholder="Введите возраст"
        />
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Дата рождения:</label>
        <input v-model="personalData.birthDate" @input="saveToStorage" type="date" />
      </div>
      <div class="form-group">
        <label>Инвалидность:</label>
        <input
          v-model="personalData.disability"
          @input="saveToStorage"
          type="text"
          placeholder="Укажите при наличии"
        />
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Номер телефона:</label>
        <input
          v-model="personalData.phone"
          @input="saveToStorage"
          type="tel"
          placeholder="+7 (XXX) XXX-XX-XX"
        />
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Электронная почта:</label>
        <input
          v-model="personalData.email"
          @input="saveToStorage"
          type="email"
          placeholder="example@domain.com"
        />
      </div>
      <div class="form-group">
        <label
          ><span class="required-asterisk">*</span> Номер курса и год прохождения занятий:</label
        >
        <input
          v-model="personalData.courseNumber"
          @input="saveToStorage"
          type="text"
          placeholder="Номер курса и год"
        />
      </div>
      <div class="form-group">
        <label>Обеденный сон (с до):</label>
        <input
          v-model="personalData.napTime"
          @input="saveToStorage"
          type="text"
          placeholder="Например: 13:00–14:00"
        />
      </div>
      <div class="form-group">
        <label>Диагноз:</label>
        <textarea
          v-model="personalData.diagnosis"
          @input="saveToStorage"
          placeholder="Укажите диагноз"
        ></textarea>
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Домашний адрес:</label>
        <textarea
          v-model="personalData.address"
          @input="saveToStorage"
          placeholder="Полный адрес"
        ></textarea>
      </div>
      <div class="form-group">
        <label><span class="required-asterisk">*</span> Посещал ли бассейн:</label>
        <select v-model="personalData.poolVisit" @input="saveToStorage">
          <option value="Да">Да</option>
          <option value="Нет">Нет</option>
        </select>
      </div>
    </div>

    <!-- Блок вопросов анкеты -->
    <div class="questions-section">
      <h3>Вопросы анкеты</h3>
    </div>

    <div v-for="question in questions" :key="question.id" class="question">
      <h3><span class="required-asterisk">*</span> {{ question.text }}</h3>
      <div class="answers">
        <button
          v-for="answer in question.answers"
          :key="answer"
          @click="toggleAnswer(question.id, answer)"
          :class="{
            selected: isAnswerSelected(question.id, answer),
          }"
          class="answer-btn"
        >
          {{ answer }}
        </button>
      </div>

      <!-- Поле пользовательского ввода -->
      <div v-if="question.customInput" class="custom-input-container">
        <input
          v-model="customAnswers[question.id]"
          @input="saveToStorage"
          :type="question.inputType || 'text'"
          :min="question.min !== undefined ? question.min : undefined"
          :placeholder="question.placeholder"
        />
        <span v-if="question.unit" class="unit">{{ question.unit }}</span>
      </div>
    </div>
  </div>

  <!-- Сообщение об ошибке, если есть неотвеченные вопросы -->
  <div v-if="error" class="error-message">
    {{ error }}
  </div>

  <button @click="submitForm" class="submit-btn">
    {{ isSubmitting ? 'Отправка...' : 'Отправить анкету' }}
  </button>
</template>

<script setup lang="ts">
import { init, send } from '@emailjs/browser'

import { ref, onMounted, computed } from 'vue'
import ConsentSection from './ConsentSection.vue'

const customAnswers = ref<{
  [key: number]: string
}>({})

// Данные для персональных полей
const personalData = ref({
  fullName: '',
  weight: '',
  height: '',
  age: '',
  birthDate: '',
  disability: '',
  phone: '',
  email: '',
  courseNumber: '',
  napTime: '',
  diagnosis: '',
  address: '',
  poolVisit: '',
})

import { QUESTIONS } from '@/data/questions.ts'

const questions = ref(QUESTIONS)

const selectedAnswers = ref<{
  [key: number]: string | string[] | null
}>({})

const error = ref('')

// Флаг блокировки отправки
const isSubmitting = ref(false)

// Ключи для localStorage
const STORAGE_KEY = 'anketa_answers'
const THEME_KEY = 'anketa_theme'
const PERSONAL_DATA_KEY = 'personal_data'

// Тема
const isDarkTheme = ref(false)

// Вычисляемое свойство для класса темы
const themeClass = computed(() => (isDarkTheme.value ? 'dark-theme' : 'light-theme'))

// Согласие на обработку персональных данных
const isConsentGiven = ref(false)
const isConsentModalVisible = ref(false)

// Функция переключения видимости модального окна
const toggleConsentModal = () => {
  isConsentModalVisible.value = !isConsentModalVisible.value
}

const isAnswerSelected = (questionId: number, answer: string): boolean => {
  const question = questions.value.find((q) => q.id === questionId)
  if (!question) return false

  const currentAnswer = selectedAnswers.value[questionId]

  if (question.multiple) {
    return Array.isArray(currentAnswer) && currentAnswer.includes(answer)
  } else {
    // Для одиночного выбора проврка, что текущее значение — строка и совпадает с ответом
    return typeof currentAnswer === 'string' && currentAnswer === answer
  }
}

// Загрузка сохранённых ответов и темы при монтировании компонента
onMounted(() => {
  init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

  // Инициализация ответов
  selectedAnswers.value = {}
  questions.value.forEach((question) => {
    if (question.multiple) {
      selectedAnswers.value[question.id] = []
    } else {
      selectedAnswers.value[question.id] = null
    }
  })

  // Загрузка из localStorage
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (savedData) {
    const parsed = JSON.parse(savedData)

    // Восстановление customAnswers
    if (parsed.custom) {
      customAnswers.value = { ...parsed.custom }
    }

    // Корректное слияние: сохранение инициализированных структур
    Object.keys(parsed.answers || {}).forEach((key) => {
      const questionId = Number(key)
      const question = questions.value.find((q) => q.id === questionId)

      if (question && question.multiple) {
        selectedAnswers.value[questionId] = Array.isArray(parsed.answers[key])
          ? parsed.answers[key]
          : []
      } else if (question) {
        selectedAnswers.value[questionId] =
          typeof parsed.answers[key] === 'string' ? parsed.answers[key] : null
      }
    })

    isConsentGiven.value = parsed.isConsentGiven || false
  }

  // Загрузка персональных данных
  const savedPersonalData = localStorage.getItem(PERSONAL_DATA_KEY)
  if (savedPersonalData) {
    personalData.value = JSON.parse(savedPersonalData)
  }

  // Загрузка темы
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'dark') {
    isDarkTheme.value = true
    document.documentElement.classList.add('dark-theme')
  } else if (savedTheme === 'light') {
    isDarkTheme.value = false
    document.documentElement.classList.remove('dark-theme')
  } else {
    // Если тема не сохранена, используем светлую по умолчанию
    isDarkTheme.value = false
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem(THEME_KEY, 'light') // фиксируем выбор
  }
})

// Функция переключения ответа (выбрать/снять выделение)

const toggleAnswer = (questionId: number, answer: string) => {
  const question = questions.value.find((q) => q.id === questionId)

  if (!question) {
    console.warn(`Вопрос с id ${questionId} не найден`)
    return
  }

  if (question.multiple) {
    if (!Array.isArray(selectedAnswers.value[questionId])) {
      selectedAnswers.value[questionId] = []
    }

    const currentAnswers = selectedAnswers.value[questionId] as string[]
    const answerIndex = currentAnswers.indexOf(answer)

    if (answerIndex > -1) {
      currentAnswers.splice(answerIndex, 1)
    } else {
      currentAnswers.push(answer)
    }
    selectedAnswers.value = { ...selectedAnswers.value }
  } else {
    selectedAnswers.value[questionId] = selectedAnswers.value[questionId] === answer ? null : answer
  }

  saveToStorage()
  error.value = ''
}

// Функция сохранения в localStorage
const saveToStorage = () => {
  // Гарантия корректных типов данных перед сохранением
  const answersToSave = { ...selectedAnswers.value }
  questions.value.forEach((question) => {
    if (question.multiple && !Array.isArray(answersToSave[question.id])) {
      answersToSave[question.id] = []
    } else if (!question.multiple && typeof answersToSave[question.id] !== 'string') {
      answersToSave[question.id] = null
    }
  })

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      isConsentGiven: isConsentGiven.value,
      answers: answersToSave,
      custom: customAnswers.value,
    }),
  )
  localStorage.setItem(PERSONAL_DATA_KEY, JSON.stringify(personalData.value))
}

// Функция переключения темы
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value

  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem(THEME_KEY, 'light')
  }
}

const formatAnswersForEmail = (answers: { [key: number]: string | string[] | null }): string => {
  return questions.value
    .map((question) => {
      const answer = answers[question.id]
      const customAnswer = customAnswers.value[question.id]

      let answerText = formatAnswers(answer)
      if (customAnswer) {
        answerText += ` (доп.: ${customAnswer})`
      }

      return `${question.text}: ${answerText}`
    })
    .join('\n\n')
}

const submitForm = async () => {
  // Блокируем повторные отправки, если уже идёт процесс
  if (isSubmitting.value) return

  // Устанавливаем флаг отправки
  isSubmitting.value = true

  try {
    // Проверка согласия на обработку данных
    if (!isConsentGiven.value) {
      error.value = 'Необходимо дать согласие на обработку персональных данных'
      return
    }

    // Проверка обязательных персональных данных
    const requiredFields = {
      fullName: 'ФИО',
      weight: 'Вес',
      height: 'Рост',
      age: 'Возраст',
      birthDate: 'Дата рождения',
      phone: 'Номер телефона',
      courseNumber: 'Номер курса и год',
      address: 'Домашний адрес',
    }

    const missingPersonalData = Object.entries(requiredFields)
      .filter(([field]) => {
        const key = field as keyof typeof personalData.value
        const value = personalData.value[key]
        return !value || value.toString().trim() === ''
      })
      .map(([, label]) => label)

    // Проверка ответов на вопросы
    const unansweredQuestions = questions.value
      .map((question) => {
        const answer = selectedAnswers.value[question.id]
        const customAnswer = customAnswers.value[question.id]

        // Случай 1: вопрос с пользовательским вводом
        if (question.customInput) {
          const hasCustomAnswer = customAnswer && customAnswer.toString().trim() !== ''
          if (question.multiple) {
            const hasSelectedAnswers = Array.isArray(answer) && answer.length > 0
            return hasSelectedAnswers || hasCustomAnswer ? undefined : question.id
          }
          return hasCustomAnswer ? undefined : question.id
        }

        // Случай 2: множественный выбор без пользовательского ввода
        if (question.multiple) {
          return Array.isArray(answer) && answer.length > 0 ? undefined : question.id
        }

        // Случай 3: одиночный выбор
        return answer !== null && answer !== undefined && answer !== '' ? undefined : question.id
      })
      .filter((id) => id !== undefined)

    // Формирование сообщения об ошибках
    const errorMessages = []

    if (!isConsentGiven.value) {
      errorMessages.push('Необходимо дать согласие на обработку персональных данных')
    }

    if (missingPersonalData.length > 0) {
      errorMessages.push(
        `Пожалуйста, заполните все персональные данные. Не заполнены: ${missingPersonalData.join(', ')}`,
      )
    }

    if (unansweredQuestions.length > 0) {
      errorMessages.push(
        `Пожалуйста, ответьте на все вопросы. Не отвечены №: ${unansweredQuestions.join(', ')}`,
      )
    }

    // Если есть ошибки — показываем и прерываем отправку
    if (errorMessages.length > 0) {
      error.value = errorMessages.join('. ') + '.'
      return
    }

    // Подготовка данных для EmailJS
    const templateParams = {
      fullName: personalData.value.fullName,
      weight: personalData.value.weight,
      height: personalData.value.height,
      age: personalData.value.age,
      birthDate: personalData.value.birthDate,
      disability: personalData.value.disability,
      phone: personalData.value.phone,
      email: personalData.value.email,
      courseNumber: personalData.value.courseNumber,
      napTime: personalData.value.napTime,
      diagnosis: personalData.value.diagnosis,
      address: personalData.value.address,
      poolVisit: personalData.value.poolVisit,
      answers: formatAnswersForEmail(selectedAnswers.value),
      to_email: import.meta.env.VITE_ADMIN_EMAIL,
    }

    // Отправка через EmailJS
    await send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
    )

    alert('Анкета успешно отправлена! Данные направлены на почту Дельфинария и вашу')
    clearStorage()
  } catch (error) {
    console.error('Ошибка отправки через EmailJS:', error)
    alert('Произошла ошибка при отправке анкеты.')
  } finally {
    // Всегда сбрасываем флаг после завершения (успеха или ошибки)
    isSubmitting.value = false
  }
}

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PERSONAL_DATA_KEY)

  // Сброс данных в интерфейсе
  selectedAnswers.value = {}
  questions.value.forEach((question) => {
    if (question.multiple) {
      selectedAnswers.value[question.id] = []
    } else {
      selectedAnswers.value[question.id] = null
    }
  })

  personalData.value = {
    fullName: '',
    weight: '',
    height: '',
    age: '',
    birthDate: '',
    disability: '',
    phone: '',
    email: '',
    courseNumber: '',
    napTime: '',
    diagnosis: '',
    address: '',
    poolVisit: '',
  }

  customAnswers.value = {}
  error.value = ''
  isConsentGiven.value = false
}

// Функция для форматирования ответов (массивы в строку)
const formatAnswers = (answers: string | string[] | null | undefined): string => {
  if (Array.isArray(answers)) {
    return answers.join(', ')
  }
  return answers || 'Не выбран'
}
</script>
