# Google Sheets Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Note your project name

## Step 2: Enable Google Sheets API

1. In your Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it and click **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - Service account name: `discord-bot-sheets`
   - Description: "Service account for Discord bot to read Google Sheets"
4. Click **Create and Continue**
5. Skip optional steps and click **Done**

## Step 4: Generate Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create** - a JSON file will download

## Step 5: Extract Credentials from JSON

Open the downloaded JSON file. You'll need two values:

```json
{
  "client_email": "discord-bot-sheets@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

## Step 6: Share Your Google Sheet

1. Open your Google Sheet
2. Click **Share** button (top right)
3. Paste the `client_email` from the JSON file
4. Give it **Viewer** permissions
5. Uncheck "Notify people" and click **Share**

## Step 7: Get Your Spreadsheet ID

From your Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
                                      ^^^^^^^^^^^^^^^^^^^
                                      This is your ID
```

## Step 8: Update Your .env File

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=discord-bot-sheets@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j
```

**Important**: 
- Keep the quotes around the private key
- Keep the `\n` characters in the private key
- Don't add extra spaces

## Step 9: Test It

1. Make sure your sheet has data in Sheet1 with headers in row 1
2. Run your bot: `npm start`
3. In Discord, type `!sheet` or `/sheet`

## Troubleshooting

**"Permission denied" error:**
- Make sure you shared the sheet with the service account email
- Double-check the spreadsheet ID

**"Invalid credentials" error:**
- Verify the private key has `\n` characters preserved
- Make sure quotes are around the private key in .env

**"No data found":**
- Check that your sheet name matches (default is 'Sheet1')
- Ensure there's data in cells A1 onwards
