function initializeCharts() {
    const canvas = document.getElementById('activityChart');
    const ctx = canvas.getContext('2d');
    
    // Simple bar chart
    const data = [65, 59, 80, 81, 56, 55, 40];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    drawBarChart(ctx, data, labels);
}

function drawBarChart(ctx, data, labels) {
    const canvas = ctx.canvas;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    const barWidth = width / data.length;
    const maxValue = Math.max(...data);
    
    ctx.fillStyle = '#3498db';
    
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * (height - 40);
        const x = index * barWidth + 10;
        const y = height - barHeight - 20;
        
        ctx.fillRect(x, y, barWidth - 20, barHeight);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(labels[index], x + 5, height - 5);
        ctx.fillStyle = '#3498db';
    });
}