export const APP_CONFIG = {
    VERSION: '1.0.0',
    EDITION: 'DAILY EDITION',
    MOTTO: "All the News That's Fit to Feed",
    LOCATION_FALLBACK: 'MANILA, PHILIPPINES',
    WEATHER_FALLBACK: 'FAIR & SUNNY',

    // News Sources and Categories
    FEED_CATEGORIES: [
        {
            name: 'Philippines News',
            feeds: [
                { name: 'Manila Times - Headlines', url: 'https://www.manilatimes.net/news/feed/', description: 'National and local dispatches', shortName: 'The Manila Times' },
                { name: 'Manila Times - Business', url: 'https://www.manilatimes.net/business/feed/', description: 'Markets and commerce news', shortName: 'The Manila Times' },
                { name: 'Philstar - Headlines', url: 'https://www.philstar.com/rss/headlines', description: 'Major stories in the archipelago', shortName: 'Philstar' },
                { name: 'Philstar - Nation', url: 'https://www.philstar.com/rss/nation', description: 'Provincial news on the wire', shortName: 'Philstar' },
                { name: 'GMA News', url: 'https://www.gmanetwork.com/news/rss', description: 'Serbisyong Totoo dispatches', shortName: 'GMA News' },
                { name: 'ABS-CBN News', url: 'https://news.abs-cbn.com/feed', description: 'In the service of the Filipino', shortName: 'ABS-CBN News' },
                { name: 'Rappler', url: 'https://www.rappler.com/feed', description: 'Independent and fearless journalism', shortName: 'Rappler' },
                { name: 'Inquirer.net', url: 'https://www.inquirer.net/fullfeed', description: 'Balanced news, fearless views', shortName: 'Inquirer' },
                { name: 'Manila Bulletin', url: 'https://mb.com.ph/feed/', description: "The nation's leading newspaper", shortName: 'Manila Bulletin' },
                { name: 'BusinessWorld', url: 'https://www.bworldonline.com/feed/', description: 'Strategic business intelligence', shortName: 'BusinessWorld' }
            ]
        },
        {
            name: 'International News',
            feeds: [
                { name: 'BBC News - World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', description: 'Global dispatches from the London wire', shortName: 'BBC News' },
                { name: 'Reuters - World News', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', description: 'Instant worldwide reports', shortName: 'Reuters' },
                { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', description: 'Middle East and global perspective', shortName: 'Al Jazeera' },
                { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', description: 'International analysis and reports', shortName: 'The Guardian' },
                { name: 'CNN International', url: 'http://rss.cnn.com/rss/edition_world.rss', description: 'Worldwide breaking news', shortName: 'CNN' },
                { name: 'NYT - World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', description: 'Global coverage from New York', shortName: 'New York Times' },
                { name: 'Associated Press', url: 'https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&hl=en-US&gl=US&ceid=US:en', description: 'Reliable global updates', shortName: 'AP News' }
            ]
        },
        {
            name: 'Technology',
            feeds: [
                { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', description: 'The latest in machines and industry', shortName: 'TechCrunch' },
                { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', description: 'Future technology and culture', shortName: 'The Verge' },
                { name: 'Wired', url: 'https://www.wired.com/feed/rss', description: 'Modern technology and its impact', shortName: 'Wired' },
                { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', description: 'Gadgets and hardware reports', shortName: 'Engadget' },
                { name: 'Mashable', url: 'https://mashable.com/feeds/rss/all', description: 'Tech, media, and digital trends', shortName: 'Mashable' },
                { name: 'CNET', url: 'https://www.cnet.com/rss/all/', description: 'Tech reviews and news', shortName: 'CNET' },
                { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', description: 'Deep tech analysis', shortName: 'Ars Technica' }
            ]
        },
        {
            name: 'Business & Finance',
            feeds: [
                { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', description: 'Global financial analysis', shortName: 'Financial Times' },
                { name: 'Bloomberg - Markets', url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml', description: 'Stock markets and wealth', shortName: 'Bloomberg' },
                { name: 'Forbes - Real Time', url: 'https://www.forbes.com/real-time/feed2/', description: 'Business leadership and news', shortName: 'Forbes' },
                { name: 'WSJ - World News', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', description: 'Wall Street international wire', shortName: 'Wall Street Journal' },
                { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', description: 'Business and market data', shortName: 'CNBC' },
                { name: 'The Economist', url: 'https://www.economist.com/sections/international/rss.xml', description: 'Global business and politics', shortName: 'Economist' }
            ]
        },
        {
            name: 'Entertainment',
            feeds: [
                { name: 'Variety', url: 'https://variety.com/feed/', description: 'Film, TV, and music industry', shortName: 'Variety' },
                { name: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', description: 'Hollywood news and analysis', shortName: 'THR' },
                { name: 'TMZ', url: 'https://www.tmz.com/rss', description: 'Celebrity and entertainment news', shortName: 'TMZ' },
                { name: 'Rolling Stone', url: 'https://www.rollingstone.com/feed/', description: 'Music and culture wire', shortName: 'Rolling Stone' },
                { name: 'Billboard', url: 'https://www.billboard.com/feed/', description: 'The charts and music news', shortName: 'Billboard' }
            ]
        },
        {
            name: 'Sports',
            feeds: [
                { name: 'ESPN - Top News', url: 'https://www.espn.com/espn/rss/news', description: 'Athletic world updates', shortName: 'ESPN' },
                { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', description: 'Sports reporting from across the globe', shortName: 'BBC Sport' },
                { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', description: 'Premier League and global sports', shortName: 'Sky Sports' },
                { name: 'CBS Sports', url: 'https://www.cbssports.com/rss/external/headlines', description: 'American sports focus', shortName: 'CBS Sports' },
                { name: 'Bleacher Report', url: 'https://bleacherreport.com/articles/feed', description: 'Sports culture and updates', shortName: 'Bleacher Report' }
            ]
        },
        {
            name: 'Gaming News',
            feeds: [
                { name: 'IGN', url: 'https://feeds.feedburner.com/ign/all', description: 'Gaming reviews and news', shortName: 'IGN' },
                { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/news/', description: 'Video game updates', shortName: 'GameSpot' },
                { name: 'Kotaku', url: 'https://kotaku.com/rss', description: 'Gaming culture and news', shortName: 'Kotaku' },
                { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', description: 'PC gaming headquarters', shortName: 'PC Gamer' },
                { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', description: 'Games and entertainment', shortName: 'Polygon' }
            ]
        },
        {
            name: 'Science & Health',
            feeds: [
                { name: 'Scientific American', url: 'https://www.scientificamerican.com/feed/', description: 'Human discovery and science', shortName: 'Scientific American' },
                { name: 'Nature News', url: 'https://www.nature.com/nature.rss', description: 'Research and academic dispatches', shortName: 'Nature' },
                { name: 'WHO - Global Health', url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', description: 'World health updates', shortName: 'WHO' },
                { name: 'NPR Health', url: 'https://feeds.npr.org/1128/rss.xml', description: 'Health news and features', shortName: 'NPR' }
            ]
        }
    ],

    getSourceName: (url: string): string => {
        // Search within FEED_CATEGORIES first for a direct URL match
        for (const category of APP_CONFIG.FEED_CATEGORIES) {
            const found = category.feeds.find(feed => feed.url === url);
            if (found && found.shortName) return found.shortName;
        }

        // Fallback logic for unknown URLs
        try {
            const hostname = new URL(url).hostname;
            const parts = hostname.replace('www.', '').split('.');
            if (parts.length > 0) {
                const name = parts[0];
                return name.charAt(0).toUpperCase() + name.slice(1);
            }
        } catch (e) {
            // ignore
        }

        return 'News Wire';
    }
};
