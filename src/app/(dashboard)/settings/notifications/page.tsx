"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, MessageSquare, Smartphone, Save } from "lucide-react"
import { registerPushNotifications, unregisterPushNotifications } from "@/lib/pushNotifications"
import { useSession } from "next-auth/react"

interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  sessionReminders: boolean
  paymentDue: boolean
  attendanceUpdates: boolean
  newStudents: boolean
  systemUpdates: boolean
}

export default function NotificationSettingsPage() {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    sessionReminders: true,
    paymentDue: true,
    attendanceUpdates: true,
    newStudents: false,
    systemUpdates: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => {
    checkPushSupport()
    loadPreferences()
  }, [])

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setPushSupported(supported)

    if (supported && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }

  const loadPreferences = async () => {
    try {
      // Load user preferences from session or API
      // For now, we'll use default preferences
      setLoading(false)
    } catch (error) {
      console.error("Failed to load preferences:", error)
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      // Save preferences to backend
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationPreferences: preferences,
        }),
      })

      if (response.ok) {
        alert("Preferences saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save preferences:", error)
      alert("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const subscription = await registerPushNotifications()
      if (subscription) {
        setPushEnabled(true)
        setPreferences(prev => ({ ...prev, push: true }))
      }
    } else {
      await unregisterPushNotifications()
      setPushEnabled(false)
      setPreferences(prev => ({ ...prev, push: false }))
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading notification settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-600">Configure how you receive notifications and updates</p>
      </div>

      {/* Notification Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Methods
          </CardTitle>
          <CardDescription>
            Choose how you'd like to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email}
              onCheckedChange={(checked) => updatePreference("email", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <Label htmlFor="sms-notifications" className="text-base font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive important notifications via SMS
                </p>
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={preferences.sms}
              onCheckedChange={(checked) => updatePreference("sms", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-purple-500" />
              <div>
                <Label htmlFor="push-notifications" className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in your browser
                  {!pushSupported && " (Not supported in this browser)"}
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.push && pushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={!pushSupported}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="session-reminders" className="text-base font-medium">
                Session Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming training sessions
              </p>
            </div>
            <Switch
              id="session-reminders"
              checked={preferences.sessionReminders}
              onCheckedChange={(checked) => updatePreference("sessionReminders", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-due" className="text-base font-medium">
                Payment Due Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications when payments are due or overdue
              </p>
            </div>
            <Switch
              id="payment-due"
              checked={preferences.paymentDue}
              onCheckedChange={(checked) => updatePreference("paymentDue", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="attendance-updates" className="text-base font-medium">
                Attendance Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications when attendance is marked for students
              </p>
            </div>
            <Switch
              id="attendance-updates"
              checked={preferences.attendanceUpdates}
              onCheckedChange={(checked) => updatePreference("attendanceUpdates", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-students" className="text-base font-medium">
                New Student Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new students are registered
              </p>
            </div>
            <Switch
              id="new-students"
              checked={preferences.newStudents}
              onCheckedChange={(checked) => updatePreference("newStudents", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-updates" className="text-base font-medium">
                System Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Important system announcements and updates
              </p>
            </div>
            <Switch
              id="system-updates"
              checked={preferences.systemUpdates}
              onCheckedChange={(checked) => updatePreference("systemUpdates", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}