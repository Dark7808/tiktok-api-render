const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

app.get('/ping', (req, res) => res.status(200).send('OK'));

// ১. একক ভিডিও ডেটা
app.get('/api/video', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const response = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
    const data = await response.json();
    if (data && data.code === 0 && data.data) {
      res.json({ success: true, data: data.data });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ২. ইউজারের সব ভিডিও (Username থেকে sec_uid বের করে)
app.get('/api/user', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    // প্রথমে ইউজারের sec_uid বের করা
    const uRes = await fetch(`https://tikwm.com/api/user/info?unique_id=${username}`);
    const uJson = await uRes.json();
    
    if (!uJson || uJson.code !== 0 || !uJson.data || !uJson.data.user) {
      return res.json({ success: false, error: 'ইউজার পাওয়া যায়নি' });
    }
    
    const secUid = uJson.data.user.sec_uid;
    
    // sec_uid দিয়ে সব ভিডিও আনা
    const response = await fetch(`https://tikwm.com/api/user/posts?sec_uid=${secUid}&count=50`);
    const data = await response.json();
    
    if (data.code === 0 && data.data && data.data.videos) {
      const videos = data.data.videos.map(v => ({
        title: v.title || 'No Title',
        link: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.id}`,
        thumbnail: v.cover || v.origin_cover
      }));
      res.json({ success: true, videos });
    } else {
      res.json({ success: false, error: 'কোনো ভিডিও পাওয়া যায়নি' });
    }
  } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// ৩. হ্যাশট্যাগের সব ভিডিও (Hashtag Name থেকে ch_id বের করে)
app.get('/api/hashtag', async (req, res) => {
  const tag = req.query.tag;
  if (!tag) return res.status(400).json({ error: 'Hashtag required' });
  try {
    // প্রথমে হ্যাশট্যাগের ch_id বের করা
    const chRes = await fetch(`https://tikwm.com/api/challenge/info?ch_name=${encodeURIComponent(tag)}`);
    const chJson = await chRes.json();
    
    if (!chJson || chJson.code !== 0 || !chJson.data || !chJson.data.challenge) {
      return res.json({ success: false, error: 'হ্যাশট্যাগ খুঁজে পাওয়া যায়নি' });
    }
    
    const chId = chJson.data.challenge.id;
    
    // ch_id দিয়ে সব ভিডিও আনা
    const response = await fetch(`https://tikwm.com/api/challenge/posts?ch_id=${chId}&count=50`);
    const data = await response.json();
    
    if (data.code === 0 && data.data && data.data.videos) {
      const videos = data.data.videos.map(v => ({
        title: v.title || 'No Title',
        link: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.id}`,
        thumbnail: v.cover || v.origin_cover
      }));
      res.json({ success: true, videos });
    } else {
      res.json({ success: false, error: 'এই হ্যাশট্যাগে কোনো ভিডিও পাওয়া যায়নি' });
    }
  } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// ৪. মিউজিকের ভিডিও (Discover এর জন্য)
app.get('/api/music', async (req, res) => {
  const musicId = req.query.music_id;
  if (!musicId) return res.status(400).json({ error: 'Music ID required' });
  try {
    const response = await fetch(`https://tikwm.com/api/music/posts?music_id=${musicId}&count=30`);
    const data = await response.json();
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
