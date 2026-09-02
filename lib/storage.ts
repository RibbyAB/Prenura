// Persistent file-based storage for development
// In production, replace with actual database

import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const CHAT_MESSAGES_FILE = path.join(DATA_DIR, "chat-messages.json")
const CHAT_SESSIONS_FILE = path.join(DATA_DIR, "chat-sessions.json")
const HEALTH_DATA_FILE = path.join(DATA_DIR, "health-data.json")
const RISK_ASSESSMENTS_FILE = path.join(DATA_DIR, "risk-assessments.json")
const USER_SYMPTOMS_FILE = path.join(DATA_DIR, "user-symptoms.json")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error("[Storage] Error creating data directory:", error)
  }
}

// Load data from file with validation
async function loadFromFile<T>(filePath: string, defaultValue: T[]): Promise<T[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, "utf-8")
    if (!data || data.trim() === "") {
      return defaultValue
    }
    const parsed = JSON.parse(data)
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.error(`[Storage] Invalid data format in ${filePath}, expected array`)
      return defaultValue
    }
    return parsed
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File doesn't exist, return default
      return defaultValue
    }
    console.error(`[Storage] Error loading ${filePath}:`, error)
    return defaultValue
  }
}

// Save data to file with error handling
async function saveToFile<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await ensureDataDir()
    const jsonData = JSON.stringify(data, null, 2)
    await fs.writeFile(filePath, jsonData, "utf-8")
  } catch (error) {
    console.error(`[Storage] Error saving ${filePath}:`, error)
    throw error // Re-throw to allow caller to handle
  }
}

interface User {
  id: string
  email: string
  password: string // In production, this should be hashed
  nama: string
  umur: string
  nomorHp: string
  role: "ibu-hamil"
  hpht?: string
  tanggalLahir?: string
  createdAt: string
  pregnancyData?: any
}

interface ChatMessage {
  id: string
  session_id: string
  user_id: string
  role: "user" | "assistant"
  message: string
  created_at: string
}

interface ChatSession {
  session_id: string
  user_id: string
  preview: string
  created_at: string
  updated_at: string
}

interface HealthData {
  id: string
  ibu_hamil_id: string
  tekanan_darah_sistolik: number
  tekanan_darah_diastolik: number
  hemoglobin: number
  berat_badan: number
  mood: "Baik" | "Sedang" | "Buruk"
  energi: "Baik" | "Sedang" | "Buruk"
  tanggal_pemeriksaan: string
  catatan?: string
  usia_kehamilan?: number
  postpartum_minggu?: number
  created_at: string
}

interface RiskAssessment {
  id: string
  user_id: string
  method: "rule-based-urgent" | "rule-based-normal" | "hybrid-ai" | "rule-based-fallback"
  risiko_level: "RENDAH" | "SEDANG" | "TINGGI" | "SANGAT_TINGGI"
  skor_poin: number
  faktor_risiko: any
  penjelasan?: string | null
  rekomendasi?: any
  peringatan_darurat?: boolean
  pesan_darurat?: string | null
  confidence?: "high" | "medium" | "low"
  input_data?: any
  rule_based_result?: any
  ai_result?: any
  created_at: string
}

interface UserSymptoms {
  id: string
  user_id: string
  gejala: string[]
  created_at: string
  updated_at: string
}

// Persistent storage - loaded from files
let users: User[] = []
let chatMessages: ChatMessage[] = []
let chatSessions: ChatSession[] = []
let healthData: HealthData[] = []
let riskAssessments: RiskAssessment[] = []
let userSymptoms: UserSymptoms[] = []

// Initialize storage - load data from files
let isInitialized = false
let initializationPromise: Promise<void> | null = null

async function initializeStorage() {
  if (isInitialized) return
  if (initializationPromise) return initializationPromise
  
  initializationPromise = (async () => {
    try {
      // Load all data in parallel for better performance
      const [loadedUsers, loadedMessages, loadedSessions, loadedHealth, loadedRisks, loadedSymptoms] = await Promise.all([
        loadFromFile<User>(USERS_FILE, []),
        loadFromFile<ChatMessage>(CHAT_MESSAGES_FILE, []),
        loadFromFile<ChatSession>(CHAT_SESSIONS_FILE, []),
        loadFromFile<HealthData>(HEALTH_DATA_FILE, []),
        loadFromFile<RiskAssessment>(RISK_ASSESSMENTS_FILE, []),
        loadFromFile<UserSymptoms>(USER_SYMPTOMS_FILE, []),
      ])
      
      users = loadedUsers
      chatMessages = loadedMessages
      chatSessions = loadedSessions
      healthData = loadedHealth
      riskAssessments = loadedRisks
      userSymptoms = loadedSymptoms
      
      isInitialized = true
      console.log("[Storage] Data loaded successfully:", {
        users: users.length,
        chatMessages: chatMessages.length,
        chatSessions: chatSessions.length,
        healthData: healthData.length,
        riskAssessments: riskAssessments.length,
        userSymptoms: userSymptoms.length,
      })
    } catch (error) {
      console.error("[Storage] Error initializing storage:", error)
      // Initialize with empty arrays on error
      users = []
      chatMessages = []
      chatSessions = []
      healthData = []
      riskAssessments = []
      userSymptoms = []
      isInitialized = true // Mark as initialized even on error to prevent infinite retries
    }
  })()
  
  return initializationPromise
}

// Auto-initialize on module load
initializeStorage().catch(console.error)

// User storage functions
export async function findUserByEmail(email: string): Promise<User | undefined> {
  await initializeStorage()
  if (!email || typeof email !== "string") {
    return undefined
  }
  const normalizedEmail = email.toLowerCase().trim()
  const user = users.find((u) => u.email.toLowerCase().trim() === normalizedEmail)
  return user
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  await initializeStorage()
  
  // Validate email uniqueness
  const normalizedEmail = userData.email.toLowerCase().trim()
  const existingUser = users.find((u) => u.email.toLowerCase().trim() === normalizedEmail)
  if (existingUser) {
    throw new Error("Email already exists")
  }
  
  const user: User = {
    ...userData,
    email: normalizedEmail, // Normalize email
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  await saveToFile(USERS_FILE, users)
  return user
}

export async function getUserById(id: string): Promise<User | undefined> {
  await initializeStorage()
  return users.find((u) => u.id === id)
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt" | "email">>): Promise<User> {
  await initializeStorage()
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) {
    throw new Error("User not found")
  }
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  }
  
  await saveToFile(USERS_FILE, users)
  return users[userIndex]
}

export async function deleteUser(id: string): Promise<{ deleted: boolean; deletedData: { healthData: number; chatSessions: number; chatMessages: number; riskAssessments: number; symptoms: number } }> {
  await initializeStorage()
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // Count data to be deleted
  const deletedHealthData = healthData.filter((h) => h.ibu_hamil_id === id).length
  const deletedSessions = chatSessions.filter((s) => s.user_id === id).length
  const deletedMessages = chatMessages.filter((m) => m.user_id === id).length
  const deletedRisks = riskAssessments.filter((r) => r.user_id === id).length
  const deletedSymptoms = userSymptoms.filter((s) => s.user_id === id).length

  // Delete user
  users.splice(userIndex, 1)
  await saveToFile(USERS_FILE, users)

  // Delete related data
  healthData = healthData.filter((h) => h.ibu_hamil_id !== id)
  await saveToFile(HEALTH_DATA_FILE, healthData)

  chatSessions = chatSessions.filter((s) => s.user_id !== id)
  await saveToFile(CHAT_SESSIONS_FILE, chatSessions)

  chatMessages = chatMessages.filter((m) => m.user_id !== id)
  await saveToFile(CHAT_MESSAGES_FILE, chatMessages)

  riskAssessments = riskAssessments.filter((r) => r.user_id !== id)
  await saveToFile(RISK_ASSESSMENTS_FILE, riskAssessments)

  userSymptoms = userSymptoms.filter((s) => s.user_id !== id)
  await saveToFile(USER_SYMPTOMS_FILE, userSymptoms)

  return {
    deleted: true,
    deletedData: {
      healthData: deletedHealthData,
      chatSessions: deletedSessions,
      chatMessages: deletedMessages,
      riskAssessments: deletedRisks,
      symptoms: deletedSymptoms,
    },
  }
}

// Chat storage functions
export async function createChatSession(userId: string, preview: string): Promise<string> {
  await initializeStorage()
  const sessionId = `chat_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const session: ChatSession = {
    session_id: sessionId,
    user_id: userId,
    preview: preview || "Chat baru",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  chatSessions.push(session)
  await saveToFile(CHAT_SESSIONS_FILE, chatSessions)
  return sessionId
}

export async function saveChatMessage(
  sessionId: string,
  userId: string,
  role: "user" | "assistant",
  message: string
): Promise<ChatMessage> {
  await initializeStorage()
  const chatMessage: ChatMessage = {
    id: Date.now().toString(),
    session_id: sessionId,
    user_id: userId,
    role,
    message,
    created_at: new Date().toISOString(),
  }
  chatMessages.push(chatMessage)
  await saveToFile(CHAT_MESSAGES_FILE, chatMessages)

  // Update session preview and updated_at
  const session = chatSessions.find((s) => s.session_id === sessionId)
  if (session) {
    session.updated_at = new Date().toISOString()
    if (role === "user" && !session.preview) {
      session.preview = message.substring(0, 50)
    }
    await saveToFile(CHAT_SESSIONS_FILE, chatSessions)
  }

  return chatMessage
}

export async function getChatSessionsByUserId(userId: string): Promise<ChatSession[]> {
  await initializeStorage()
  return chatSessions
    .filter((s) => s.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

export async function getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
  await initializeStorage()
  return chatMessages
    .filter((m) => m.session_id === sessionId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

// Delete chat session and its messages
export async function deleteChatSession(sessionId: string, userId: string): Promise<{ deletedSession: boolean; deletedMessages: number }> {
  await initializeStorage()
  const sessionIndex = chatSessions.findIndex((s) => s.session_id === sessionId && s.user_id === userId)
  const deletedSession = sessionIndex !== -1
  if (deletedSession) {
    chatSessions.splice(sessionIndex, 1)
    await saveToFile(CHAT_SESSIONS_FILE, chatSessions)
  }

  const before = chatMessages.length
  chatMessages = chatMessages.filter((m) => m.session_id !== sessionId || m.user_id !== userId)
  const after = chatMessages.length
  await saveToFile(CHAT_MESSAGES_FILE, chatMessages)

  return { deletedSession, deletedMessages: before - after }
}

// Delete all chat sessions for a user (and their messages)
export async function deleteAllChatSessionsForUser(userId: string): Promise<{ deletedSessions: number; deletedMessages: number }> {
  await initializeStorage()
  const beforeSessions = chatSessions.length
  chatSessions = chatSessions.filter((s) => s.user_id !== userId)
  const deletedSessions = beforeSessions - chatSessions.length
  await saveToFile(CHAT_SESSIONS_FILE, chatSessions)

  const beforeMessages = chatMessages.length
  chatMessages = chatMessages.filter((m) => m.user_id !== userId)
  const deletedMessages = beforeMessages - chatMessages.length
  await saveToFile(CHAT_MESSAGES_FILE, chatMessages)

  return { deletedSessions, deletedMessages }
}

// Health data storage functions
export async function addHealthData(data: Omit<HealthData, "id" | "created_at">): Promise<HealthData> {
  await initializeStorage()
  const health: HealthData = {
    ...data,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }
  healthData.push(health)
  await saveToFile(HEALTH_DATA_FILE, healthData)
  return health
}

export async function getHealthDataByIbuHamilId(ibuHamilId: string): Promise<HealthData[]> {
  await initializeStorage()
  return healthData
    .filter((h) => h.ibu_hamil_id === ibuHamilId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getLatestHealthData(ibuHamilId: string): Promise<HealthData | null> {
  const data = await getHealthDataByIbuHamilId(ibuHamilId)
  return data.length > 0 ? data[0] : null
}

// Development helper: Clear all data (async to save to files)
export async function clearAllData(): Promise<void> {
  await initializeStorage()
  users = []
  chatMessages = []
  chatSessions = []
  healthData = []
  riskAssessments = []
  userSymptoms = []
  
  // Clear files
  await Promise.all([
    saveToFile(USERS_FILE, []),
    saveToFile(CHAT_MESSAGES_FILE, []),
    saveToFile(CHAT_SESSIONS_FILE, []),
    saveToFile(HEALTH_DATA_FILE, []),
    saveToFile(RISK_ASSESSMENTS_FILE, []),
    saveToFile(USER_SYMPTOMS_FILE, []),
  ])
}

// User symptoms storage functions
export async function saveUserSymptoms(userId: string, gejala: string[]): Promise<UserSymptoms> {
  await initializeStorage()
  const existing = userSymptoms.find((s) => s.user_id === userId)
  const now = new Date().toISOString()
  
  if (existing) {
    existing.gejala = gejala
    existing.updated_at = now
    await saveToFile(USER_SYMPTOMS_FILE, userSymptoms)
    return existing
  } else {
    const newSymptoms: UserSymptoms = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      gejala,
      created_at: now,
      updated_at: now,
    }
    userSymptoms.push(newSymptoms)
    await saveToFile(USER_SYMPTOMS_FILE, userSymptoms)
    return newSymptoms
  }
}

export async function getUserSymptoms(userId: string): Promise<string[]> {
  await initializeStorage()
  const symptoms = userSymptoms.find((s) => s.user_id === userId)
  return symptoms?.gejala || []
}

// Risk assessment storage
export async function addRiskAssessment(data: Omit<RiskAssessment, "id" | "created_at">): Promise<RiskAssessment> {
  await initializeStorage()
  const record: RiskAssessment = {
    ...data,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }
  riskAssessments.push(record)
  await saveToFile(RISK_ASSESSMENTS_FILE, riskAssessments)
  return record
}

export async function getRiskAssessmentsByUser(userId: string): Promise<RiskAssessment[]> {
  await initializeStorage()
  return riskAssessments
    .filter((r) => r.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

