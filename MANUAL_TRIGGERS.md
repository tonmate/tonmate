# Manual Workflow Triggers

## 🚀 How to Trigger Workflows Manually

### 1. **Go to GitHub Actions**
- Navigate to your repository
- Click on the **"Actions"** tab
- Find the **"CI/CD Pipeline"** workflow
- Click on it

### 2. **Use "Run workflow" Button**
- Click the **"Run workflow"** dropdown button (top right)
- Select options and click **"Run workflow"**

## 🎯 **Available Manual Actions**

### **🔄 Full Pipeline**
- **What it does**: Test → Build → Deploy
- **When to use**: After major changes or releases
- **Dependencies**: Runs all stages in sequence

### **🚀 Deploy Only**
- **What it does**: Deploy existing Docker image
- **When to use**: Deploy a previously built image
- **Dependencies**: Skips build, uses existing image
- **Image tag**: Specify which tag to deploy (default: `latest`)

### **🗃️ Migrations Only**
- **What it does**: Run database migrations only
- **When to use**: After database schema changes
- **Dependencies**: Independent of other jobs

## 📋 **Parameters**

### **Action** (Required)
- `full-pipeline` - Complete CI/CD process
- `deploy-only` - Just deployment
- `migrations-only` - Just run migrations

### **Environment** (Required)
- `production` - Deploy to production server

### **Tag** (Optional)
- Default: `latest`
- Examples: `v1.2.3`, `main`, `dev-latest`
- Use specific versions for rollbacks

## 🎯 **Common Use Cases**

### **Deploy Latest Release**
```
Action: deploy-only
Environment: production
Tag: latest
```

### **Deploy Specific Version**
```
Action: deploy-only
Environment: production
Tag: v1.2.3
```

### **Run Database Migrations**
```
Action: migrations-only
Environment: production
Tag: (not used)
```

### **Full Release Pipeline**
```
Action: full-pipeline
Environment: production
Tag: (not used - uses latest build)
```

## 🔍 **Monitoring**

After triggering:
1. **Watch the workflow run** in real-time
2. **Check logs** for any errors
3. **Verify deployment** success
4. **Monitor application** health

## 🚨 **Troubleshooting**

### **No "Run workflow" Button?**
- Make sure you're on the main branch
- Check if you have write permissions to the repo
- Refresh the page

### **Deploy Job Skipped?**
- Check if the build job succeeded (for full-pipeline)
- Verify the action selection matches your intent
- Review the job conditions in the workflow file

### **Migration Failed?**
- Check if the application is running
- Verify database connection
- Review migration logs in the job output
