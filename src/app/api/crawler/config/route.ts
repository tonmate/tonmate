import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

// Default crawler configuration
const DEFAULT_CONFIG = {
  // Comprehensive crawling for universal website support
  maxPages: 100,
  maxDepth: 5,
  crawlDelay: 300,
  userAgent: 'AI-Support-Agent/1.0',
  concurrency: 8,
  timeout: 60000,
  retryAttempts: 3,
  maxFileSize: 25 * 1024 * 1024, // 25MB
  respectRobotsTxt: false,
  followRedirects: true,
  
  // Enhanced inclusion patterns for comprehensive content
  includePatterns: [
    '*',
    '*/pricing*',
    '*/price*',
    '*/plans*',
    '*/plan*',
    '*/features*',
    '*/feature*',
    '*/about*',
    '*/services*',
    '*/service*',
    '*/products*',
    '*/product*',
    '*/support*',
    '*/help*',
    '*/faq*',
    '*/docs*',
    '*/documentation*',
    '*/api*',
    '*/contact*',
    '*/blog*',
    '*/news*',
    '*/solutions*',
    '*/solution*',
    '*/how-to*',
    '*/howto*',
    '*/guide*',
    '*/tutorial*',
    '*/getting-started*',
    '*/overview*',
    '*/company*',
    '*/team*',
    '*/legal*',
    '*/terms*',
    '*/privacy*',
    '*/security*',
    '*/resources*',
    '*/downloads*',
    '*/integrations*',
    '*/integration*',
    '*/enterprise*',
    '*/business*',
    '*/comparison*',
    '*/compare*',
    '*/demo*',
    '*/trial*',
    '*/free*',
    '*/signup*',
    '*/sign-up*',
    '*/testimonials*',
    '*/reviews*',
    '*/case-studies*',
    '*/cases*',
    '*/customers*',
    '*/customer*',
    '*/use-cases*',
    '*/benefits*',
    '*/advantages*',
    '*/why*',
    '*/what-is*',
    '*/why-choose*',
    '*/industries*',
    '*/industry*',
    '*/partners*',
    '*/partner*',
    '*/changelog*',
    '*/updates*',
    '*/release*',
    '*/roadmap*',
    '*/status*',
    '*/community*',
    '*/forum*',
    '*/discussion*',
    '*/knowledge*',
    '*/kb*',
    '*/wiki*',
    '*/learn*',
    '*/training*',
    '*/webinar*',
    '*/event*',
    '*/conference*',
    '*/podcast*',
    '*/video*',
    '*/media*',
    '*/press*',
    '*/careers*',
    '*/jobs*',
    '*/hiring*',
    '*/investor*',
    '*/mobile*',
    '*/app*',
    '*/desktop*',
    '*/web*',
    '*/cli*',
    '*/sdk*',
    '*/library*',
    '*/plugin*',
    '*/extension*',
    '*/addon*',
    '*/tool*',
    '*/tools*',
    '*/utility*',
    '*/utilities*',
    '*/health*',
    '*/status*',
    '*/uptime*',
    '*/performance*',
    '*/benchmark*',
    '*/metrics*',
    '*/analytics*',
    '*/dashboard*',
    '*/report*',
    '*/insight*',
    '*/data*',
    '*/analysis*',
    '*/monitoring*',
    '*/tracking*',
    '*/compliance*',
    '*/governance*',
    '*/policy*',
    '*/policies*',
    '*/best-practices*',
    '*/best_practices*',
    '*/recommendation*',
    '*/recommendations*',
    '*/tip*',
    '*/tips*',
    '*/trick*',
    '*/tricks*',
    '*/hack*',
    '*/hacks*',
    '*/workflow*',
    '*/workflows*',
    '*/automation*',
    '*/optimize*',
    '*/optimization*',
    '*/performance*',
    '*/speed*',
    '*/fast*',
    '*/slow*',
    '*/issue*',
    '*/issues*',
    '*/problem*',
    '*/problems*',
    '*/troubleshoot*',
    '*/troubleshooting*',
    '*/debug*',
    '*/debugging*',
    '*/error*',
    '*/errors*',
    '*/fix*',
    '*/fixes*',
    '*/solution*',
    '*/solutions*',
    '*/resolve*',
    '*/resolution*',
    '*/maintenance*',
    '*/update*',
    '*/upgrade*',
    '*/migration*',
    '*/backup*',
    '*/restore*',
    '*/recovery*',
    '*/disaster*',
    '*/incident*',
    '*/outage*',
    '*/downtime*',
    '*/availability*',
    '*/reliability*',
    '*/scalability*',
    '*/scaling*',
    '*/architecture*',
    '*/design*',
    '*/infrastructure*',
    '*/deployment*',
    '*/deploy*',
    '*/installation*',
    '*/install*',
    '*/setup*',
    '*/configuration*',
    '*/configure*',
    '*/config*',
    '*/setting*',
    '*/settings*',
    '*/option*',
    '*/options*',
    '*/parameter*',
    '*/parameters*',
    '*/variable*',
    '*/variables*',
    '*/environment*',
    '*/env*',
    '*/development*',
    '*/dev*',
    '*/staging*',
    '*/production*',
    '*/prod*',
    '*/test*',
    '*/testing*',
    '*/qa*',
    '*/quality*',
    '*/assurance*',
    '*/validation*',
    '*/verification*',
    '*/audit*',
    '*/review*',
    '*/inspection*',
    '*/check*',
    '*/monitor*',
    '*/alert*',
    '*/notification*',
    '*/warning*',
    '*/critical*',
    '*/emergency*',
    '*/urgent*',
    '*/priority*',
    '*/important*',
    '*/essential*',
    '*/required*',
    '*/mandatory*',
    '*/optional*',
    '*/recommended*',
    '*/suggested*',
    '*/proposed*',
    '*/planned*',
    '*/future*',
    '*/upcoming*',
    '*/next*',
    '*/previous*',
    '*/history*',
    '*/archive*',
    '*/old*',
    '*/legacy*',
    '*/deprecated*',
    '*/obsolete*',
    '*/retired*',
    '*/discontinued*',
    '*/end-of-life*',
    '*/eol*',
    '*/sunset*',
    '*/migration*',
    '*/replacement*',
    '*/alternative*',
    '*/substitute*',
    '*/equivalent*',
    '*/similar*',
    '*/related*',
    '*/reference*',
    '*/link*',
    '*/external*',
    '*/third-party*',
    '*/3rd-party*',
    '*/vendor*',
    '*/supplier*',
    '*/provider*',
    '*/client*',
    '*/user*',
    '*/admin*',
    '*/administrator*',
    '*/manager*',
    '*/operator*',
    '*/developer*',
    '*/programmer*',
    '*/engineer*',
    '*/architect*',
    '*/designer*',
    '*/analyst*',
    '*/consultant*',
    '*/specialist*',
    '*/expert*',
    '*/professional*',
    '*/business*',
    '*/enterprise*',
    '*/corporate*',
    '*/organization*',
    '*/company*',
    '*/startup*',
    '*/small*',
    '*/medium*',
    '*/large*',
    '*/scale*',
    '*/growth*',
    '*/expansion*',
    '*/market*',
    '*/industry*',
    '*/sector*',
    '*/domain*',
    '*/niche*',
    '*/vertical*',
    '*/horizontal*',
    '*/global*',
    '*/international*',
    '*/local*',
    '*/regional*',
    '*/national*',
    '*/worldwide*',
    '*/universal*',
    '*/standard*',
    '*/custom*',
    '*/personalized*',
    '*/tailored*',
    '*/specific*',
    '*/general*',
    '*/common*',
    '*/popular*',
    '*/trending*',
    '*/latest*',
    '*/newest*',
    '*/recent*',
    '*/current*',
    '*/modern*',
    '*/updated*',
    '*/fresh*',
    '*/new*'
  ],
  excludePatterns: [
    '*/admin*',
    '*/wp-admin*',
    '*/login*',
    '*/auth*',
    '*/register*',
    '*/checkout*',
    '*/cart*',
    '*/search*',
    '*/tag*',
    '*/category*',
    '*/author*',
    '*/private*',
    '*.pdf',
    '*.jpg',
    '*.jpeg',
    '*.png',
    '*.gif',
    '*.svg',
    '*.css',
    '*.js',
    '*.ico',
    '*.xml',
    '*.rss',
    '*.zip',
    '*.tar',
    '*.gz'
  ],
  // Expanded file types for universal support
  allowedFileTypes: ['html', 'htm', 'php', 'asp', 'aspx', 'jsp', 'cfm', 'py', 'rb', 'pl', 'shtml'],
  
  customHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  },
  
  enableJavaScript: true,  // Changed to true for modern websites
  waitForSelector: '',
  maxConcurrentRequests: 8,  // Increased from 5
  requestInterval: 1000,     // Reduced from 2000ms
  skipDuplicates: true,
  
  // Maximum content extraction for universal support
  extractImages: true,       // Changed to true
  extractLinks: true,
  extractText: true,
  extractMetadata: true,
  
  // Enhanced content extraction options (all enabled)
  extractFullContent: true,
  preserveFormatting: true,
  extractTables: true,
  extractCodeBlocks: true
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's crawler configuration or return default
    const config = await prisma.crawlerConfiguration.findUnique({
      where: { userId: user.id }
    });

    if (!config) {
      return NextResponse.json({ config: DEFAULT_CONFIG });
    }

    // Parse JSON fields
    const parsedConfig = {
      maxPages: config.maxPages,
      maxDepth: config.maxDepth,
      crawlDelay: config.crawlDelay,
      userAgent: config.userAgent,
      concurrency: config.concurrency,
      timeout: config.timeout,
      retryAttempts: config.retryAttempts,
      maxFileSize: config.maxFileSize,
      respectRobotsTxt: config.respectRobotsTxt,
      followRedirects: config.followRedirects,
      includePatterns: JSON.parse(config.includePatterns),
      excludePatterns: JSON.parse(config.excludePatterns),
      allowedFileTypes: JSON.parse(config.allowedFileTypes),
      customHeaders: JSON.parse(config.customHeaders),
      enableJavaScript: config.enableJavaScript,
      waitForSelector: config.waitForSelector,
      maxConcurrentRequests: config.maxConcurrentRequests,
      requestInterval: config.requestInterval,
      skipDuplicates: config.skipDuplicates,
      extractImages: config.extractImages,
      extractLinks: config.extractLinks,
      extractText: config.extractText,
      extractMetadata: config.extractMetadata,
      
      // Enhanced content extraction
      extractFullContent: config.extractFullContent,
      preserveFormatting: config.preserveFormatting,
      extractTables: config.extractTables,
      extractCodeBlocks: config.extractCodeBlocks
    };

    return NextResponse.json({ config: parsedConfig });

  } catch (error) {
    console.error('Error fetching crawler configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'Configuration is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate and sanitize configuration
    const validatedConfig = {
      maxPages: Math.max(1, Math.min(config.maxPages || 10, 1000)),
      maxDepth: Math.max(1, Math.min(config.maxDepth || 3, 20)),
      crawlDelay: Math.max(100, Math.min(config.crawlDelay || 1000, 10000)),
      userAgent: config.userAgent || DEFAULT_CONFIG.userAgent,
      concurrency: Math.max(1, Math.min(config.concurrency || 3, 10)),
      timeout: Math.max(5000, Math.min(config.timeout || 30000, 120000)),
      retryAttempts: Math.max(0, Math.min(config.retryAttempts || 3, 10)),
      maxFileSize: Math.max(1024, Math.min(config.maxFileSize || 10485760, 104857600)),
      respectRobotsTxt: config.respectRobotsTxt !== false,
      followRedirects: config.followRedirects !== false,
      includePatterns: JSON.stringify(config.includePatterns || DEFAULT_CONFIG.includePatterns),
      excludePatterns: JSON.stringify(config.excludePatterns || DEFAULT_CONFIG.excludePatterns),
      allowedFileTypes: JSON.stringify(config.allowedFileTypes || DEFAULT_CONFIG.allowedFileTypes),
      customHeaders: JSON.stringify(config.customHeaders || {}),
      enableJavaScript: config.enableJavaScript === true,
      waitForSelector: config.waitForSelector || '',
      maxConcurrentRequests: Math.max(1, Math.min(config.maxConcurrentRequests || 5, 20)),
      requestInterval: Math.max(100, Math.min(config.requestInterval || 2000, 10000)),
      skipDuplicates: config.skipDuplicates !== false,
      extractImages: config.extractImages === true,
      extractLinks: config.extractLinks !== false,
      extractText: config.extractText !== false,
      extractMetadata: config.extractMetadata !== false,
      
      // Enhanced content extraction
      extractFullContent: config.extractFullContent !== false,
      preserveFormatting: config.preserveFormatting !== false,
      extractTables: config.extractTables !== false,
      extractCodeBlocks: config.extractCodeBlocks !== false
    };

    // Save configuration
    const savedConfig = await prisma.crawlerConfiguration.upsert({
      where: { userId: user.id },
      update: validatedConfig,
      create: {
        userId: user.id,
        ...validatedConfig
      }
    });

    return NextResponse.json({ 
      message: 'Crawler configuration saved successfully',
      config: savedConfig 
    });

  } catch (error) {
    console.error('Error saving crawler configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
