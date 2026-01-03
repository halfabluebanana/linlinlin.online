# Projects Directory

This directory contains individual project pages and their associated files.

## Structure

```
projects/
├── README.md (this file)
├── SERVER_SETUP.md (guide for hosting server-based projects)
├── ono-mato-dada.html (example project page)
├── 02_Ono-Mato-Dada-v3-standalone/ (standalone version - no server needed)
│   └── (project files - works without Socket.io)
├── 02_Ono-Mato-Dada-v3-full/ (full version - requires server)
│   └── (project files - needs Socket.io server)
└── [other-projects]/
    └── (project files)
```

## Project Versions

For projects that require a server (like Socket.io for real-time collaboration), we maintain two versions:

1. **Standalone Version** (`-standalone` suffix): Modified to work without a server, embedded directly on the project page
2. **Full Version** (`-full` suffix): Original version with all server features, hosted separately

The project page (`ono-mato-dada.html`) shows the standalone version embedded and provides a link to the full collaborative version.

## Adding a New Project

1. **Create project directory**: Create a folder for your project files (e.g., `my-project/`)

2. **Create project page**: Create an HTML file in the `projects/` directory (e.g., `my-project.html`)

3. **Update projects data**: Edit `script.js` and add your project to the `projects` array:
   ```javascript
   {
       id: 'my-project',
       title: 'My Project',
       description: 'Description of my project',
       thumbnail: 'media/img/my-project/thumbnail.jpg',
       link: 'projects/my-project.html'
   }
   ```

4. **Project page template**: Use `ono-mato-dada.html` as a template. It includes:
   - Version selector buttons (standalone vs. collaborative)
   - Embedded iframe for standalone version
   - Link to full collaborative version (update server URL)
   
   For server-based projects, see `SERVER_SETUP.md` for hosting instructions.

## Project Page Options

### Option 1: Iframe Embed (Recommended for standalone projects)
```html
<iframe 
    class="project-iframe"
    src="my-project/index.html"
    title="My Project"
    allowfullscreen>
</iframe>
```

### Option 2: Direct Embed
Include your project's scripts and HTML directly in the page.

### Option 3: External Link
Link to a project hosted elsewhere.

## Server-based Projects

If your project requires a server (e.g., Socket.io for real-time features):

1. Create a standalone version that works without the server
2. Keep the full version for hosting on a server
3. Update the project page to link to your server URL
4. See `SERVER_SETUP.md` for detailed hosting instructions

