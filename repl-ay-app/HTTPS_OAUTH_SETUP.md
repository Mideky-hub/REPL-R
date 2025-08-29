# 🔧 Google OAuth HTTPS Setup Guide

## ✅ Current Status
- ✅ HTTPS Server running on: `https://localhost:3000`
- ✅ Environment variables configured
- ✅ Debug logging added to AuthModal
- ❌ **Google Cloud Console needs HTTPS configuration**

## 🚨 **IMMEDIATE ACTION REQUIRED**

### **Update Google Cloud Console for HTTPS**

Your app is now running on **HTTPS**, but your Google OAuth client is likely only configured for HTTP.

**Steps to Fix:**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Find your OAuth 2.0 Client ID

2. **Update Authorized JavaScript Origins:**
   ```
   https://localhost:3000  ← ADD THIS (HTTPS)
   http://localhost:3000   ← Keep this for fallback
   ```

3. **Update Authorized Redirect URIs:**
   ```
   https://localhost:3000  ← ADD THIS (HTTPS) 
   http://localhost:3000   ← Keep this for fallback
   ```

4. **Click SAVE** ⚠️ Don't forget to save!

## 🐛 **Debug Your Issue**

### **Step 1: Check Browser Console**
1. Open `https://localhost:3000` (note the HTTPS)
2. Open Developer Tools (F12)
3. Click Google Sign-In button
4. Look for these debug messages:

**✅ Expected Success Messages:**
```
🔧 DEBUG: Starting Google OAuth process...
🔧 DEBUG: Client ID exists: true
🔧 DEBUG: Current URL: https://localhost:3000
✅ Google Identity Services loaded successfully
🔧 DEBUG: Showing Google OAuth popup...
```

**❌ Common Error Messages:**

**"Not a valid origin for the client"**
- **Fix:** Add `https://localhost:3000` to Google Console

**"Popup blocked"**
- **Fix:** Allow popups in your browser for localhost

**"Client ID not configured"**
- **Fix:** Check your `.env.local` file

### **Step 2: Test the Fix**

After updating Google Console:
1. **Wait 5-10 minutes** (Google takes time to propagate changes)
2. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Try Google Sign-In again**

## 🔍 **Verification Checklist**

- [ ] Google Console has `https://localhost:3000` in JavaScript Origins
- [ ] Google Console has `https://localhost:3000` in Redirect URIs  
- [ ] Waited 5-10 minutes after saving changes
- [ ] Cleared browser cache
- [ ] Browser allows popups for localhost
- [ ] Using HTTPS URL: `https://localhost:3000` (not HTTP)

## 🛠️ **Your OAuth Configuration**

**Current Client ID:** `805308668845-4694ovnekde86hairvhoonhhg9aatonr.apps.googleusercontent.com`

**Required Origins:**
```
https://localhost:3000  ← PRIMARY (for HTTPS server)
http://localhost:3000   ← FALLBACK (for HTTP server)
```

## 🚀 **Quick Test Commands**

```powershell
# Current HTTPS server (should be running)
cd "C:\Users\Spectrum\Documents\PROG\REPL-ay\repl-ay-app"
npm run dev:https

# Alternative: HTTP server (if HTTPS issues persist)
npm run dev
```

## 📱 **Mobile/Network Testing**

For testing from other devices:
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Add to Google Console: `https://192.168.x.x:3000`
3. Access from mobile: `https://your-ip:3000`

---

**Next Steps:**
1. ✅ Update Google Cloud Console with HTTPS origins
2. ✅ Wait 5-10 minutes  
3. ✅ Clear browser cache
4. ✅ Test at `https://localhost:3000`
5. ✅ Check browser console for debug messages

**Still not working?** Check the browser console for the specific error message and match it with the solutions above! 🔍