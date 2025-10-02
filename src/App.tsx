import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlass, 
  FunnelSimple, 
  Star, 
  GitBranch, 
  Code, 
  Calendar,
  ArrowSquareOut,
  Eye,
  ChartBar,
  SortAscending
} from '@phosphor-icons/react'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  size: number
  default_branch: string
  topics: string[]
  has_pages: boolean
  open_issues_count: number
}

interface GitHubUser {
  login: string
  name: string
  bio: string
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
}

function FlipCard({ repo, isFlipped, onFlip }: { repo: Repository; isFlipped: boolean; onFlip: () => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'C++': 'bg-pink-500',
      'C': 'bg-gray-500',
      'HTML': 'bg-red-500',
      'CSS': 'bg-purple-500',
      'Shell': 'bg-gray-600',
    }
    return colors[language || ''] || 'bg-gray-400'
  }

  return (
    <motion.div
      className={`flip-card h-80 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
      onClick={onFlip}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flip-card-inner">
        {/* Front of card */}
        <Card className="flip-card-front border-2 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-card to-muted/50">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold truncate pr-2">
                {repo.name}
              </CardTitle>
              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                <Star size={14} />
                <span className="text-sm">{repo.stargazers_count}</span>
              </div>
            </div>
            <CardDescription className="text-sm line-clamp-3 leading-relaxed">
              {repo.description || 'No description available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {repo.language && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                  {repo.language}
                </Badge>
              )}
              {repo.topics.slice(0, 3).map(topic => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Updated {formatDate(repo.updated_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch size={14} />
                <span>{repo.forks_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card className="flip-card-back border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{repo.name}</CardTitle>
            <CardDescription>Project Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium">Size</div>
                <div className="text-muted-foreground">{(repo.size / 1024).toFixed(1)} MB</div>
              </div>
              <div>
                <div className="font-medium">Issues</div>
                <div className="text-muted-foreground">{repo.open_issues_count}</div>
              </div>
              <div>
                <div className="font-medium">Created</div>
                <div className="text-muted-foreground">{formatDate(repo.created_at)}</div>
              </div>
              <div>
                <div className="font-medium">Branch</div>
                <div className="text-muted-foreground font-mono">{repo.default_branch}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                asChild 
                className="w-full" 
                onClick={(e) => e.stopPropagation()}
              >
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <Code size={16} className="mr-2" />
                  View Code
                </a>
              </Button>
              {repo.homepage && (
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                    <ArrowSquareOut size={16} className="mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function RepoGrid({ repos, flippedCards, onCardFlip }: { 
  repos: Repository[]; 
  flippedCards: Set<number>; 
  onCardFlip: (id: number) => void 
}) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {repos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <FlipCard
              repo={repo}
              isFlipped={flippedCards.has(repo.id)}
              onFlip={() => onCardFlip(repo.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="h-80">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Analytics({ repos }: { repos: Repository[] }) {
  const languageStats = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topLanguages = Object.entries(languageStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Generate mock data for advanced analytics
  const generateHeatmapData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    return days.map(day => ({
      day,
      hours: hours.map(hour => ({
        hour,
        commits: Math.floor(Math.random() * 10) + 1
      }))
    }))
  }

  const generateActivityData = () => {
    const today = new Date()
    const thisWeek = Math.floor(Math.random() * 25) + 5
    const thisMonth = Math.floor(Math.random() * 100) + 20
    const thisYear = Math.floor(Math.random() * 500) + 100
    const currentStreak = Math.floor(Math.random() * 15) + 1
    const longestStreak = Math.floor(Math.random() * 30) + 10
    const activeDays = Math.floor(Math.random() * 40) + 60
    
    return {
      thisWeek,
      thisMonth,
      thisYear,
      currentStreak,
      longestStreak,
      activeDays
    }
  }

  const generateContributionTypes = () => {
    const types = ['Commits', 'Pull Requests', 'Issues', 'Code Reviews']
    return types.map(type => ({
      type,
      count: Math.floor(Math.random() * 50) + 10,
      color: ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-muted'][types.indexOf(type)]
    }))
  }

  const generateSLAData = () => {
    return [
      { metric: 'Code Coverage', target: 80, actual: 78, unit: '%' },
      { metric: 'Build Success', target: 95, actual: 97, unit: '%' },
      { metric: 'Response Time', target: 200, actual: 180, unit: 'ms' },
      { metric: 'Uptime', target: 99.9, actual: 99.8, unit: '%' }
    ]
  }

  const heatmapData = generateHeatmapData()
  const activityData = generateActivityData()
  const contributionTypes = generateContributionTypes()
  const slaData = generateSLAData()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commits This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activityData.thisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">+{Math.floor(Math.random() * 10)} from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{activityData.currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">Longest: {activityData.longestStreak} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activityData.activeDays}%</div>
            <p className="text-xs text-muted-foreground mt-1">Days active this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Daily Contribution Heatmap
          </CardTitle>
          <CardDescription>Commit activity by time of day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <span>Less</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(intensity => (
                  <div
                    key={intensity}
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: `hsl(var(--primary) / ${intensity * 0.2})` 
                    }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
            <div className="grid grid-cols-25 gap-1 text-xs">
              <div></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-center text-muted-foreground">
                  {i % 6 === 0 ? i : ''}
                </div>
              ))}
              {heatmapData.map(({ day, hours }) => (
                <div key={day} className="contents">
                  <div className="text-muted-foreground pr-2">{day}</div>
                  {hours.map(({ hour, commits }) => (
                    <div
                      key={`${day}-${hour}`}
                      className="w-3 h-3 rounded-sm cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: `hsl(var(--primary) / ${Math.min(commits / 10, 1)})`
                      }}
                      title={`${day} ${hour}:00 - ${commits} commits`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contribution Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar size={20} />
              Contribution Mix
            </CardTitle>
            <CardDescription>Types of contributions this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributionTypes.map(({ type, count, color }) => {
                const maxCount = Math.max(...contributionTypes.map(c => c.count))
                const percentage = (count / maxCount) * 100
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${color} transition-all duration-1000`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* SLA Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Performance Targets
            </CardTitle>
            <CardDescription>SLA targets vs actual performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {slaData.map(({ metric, target, actual, unit }) => {
                const percentage = (actual / target) * 100
                const isGood = actual >= target
                
                return (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{metric}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                          {actual}{unit}
                        </span>
                        <span className="text-muted-foreground">/ {target}{unit}</span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <motion.div
                          className={`h-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                        />
                        <div 
                          className="absolute top-0 w-0.5 h-full bg-foreground/40"
                          style={{ left: `${Math.min((target / Math.max(target, actual)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Languages Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Top Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topLanguages.map(([language, count]) => (
              <div key={language} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-medium">{language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary transition-all duration-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / repos.length) * 100}%` }}
                      transition={{ delay: 0.1, duration: 0.6 }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function App() {
  const [repos, setRepos] = useKV<Repository[]>('github-repos', [])
  const [user, setUser] = useKV<GitHubUser | null>('github-user', null)
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updated')
  const [isLoading, setIsLoading] = useState(false)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

  const fetchGitHubData = async () => {
    try {
      setIsLoading(true)
      
      const currentUser = await window.spark.user()
      if (!currentUser?.login) {
        toast.error('GitHub user not found')
        return
      }

      const userResponse = await fetch(`https://api.github.com/users/${currentUser.login}`)
      const userData = await userResponse.json()
      
      const reposResponse = await fetch(`https://api.github.com/users/${currentUser.login}/repos?sort=updated&per_page=100`)
      const reposData = await reposResponse.json()

      if (userResponse.ok && reposResponse.ok) {
        setUser(userData)
        setRepos(reposData)
        toast.success(`Loaded ${reposData.length} repositories`)
      } else {
        toast.error('Failed to fetch GitHub data')
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error)
      toast.error('Error connecting to GitHub API')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!repos || repos.length === 0) {
      fetchGitHubData()
    }
  }, [])

  useEffect(() => {
    const reposArray = repos || []
    let filtered = [...reposArray]

    if (searchQuery) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        repo.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(repo => repo.language === selectedLanguage)
    }

    switch (sortBy) {
      case 'stars':
        filtered.sort((a, b) => b.stargazers_count - a.stargazers_count)
        break
      case 'forks':
        filtered.sort((a, b) => b.forks_count - a.forks_count)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'created':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default: // updated
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }

    setFilteredRepos(filtered)
  }, [repos, searchQuery, selectedLanguage, sortBy])

  const languages = [...new Set((repos || []).map(repo => repo.language).filter(Boolean))].sort()

  const handleCardFlip = (repoId: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(repoId)) {
        newSet.delete(repoId)
      } else {
        newSet.add(repoId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">GitHub Portfolio</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my projects through interactive flashcards. Click to flip and discover detailed insights about each repository.
          </p>
          {user && (
            <div className="flex items-center justify-center gap-4 mt-6 p-4 bg-card rounded-lg border max-w-md mx-auto">
              <img 
                src={user.avatar_url} 
                alt={user.name || user.login}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
              <div className="text-left">
                <h2 className="font-semibold">{user.name || user.login}</h2>
                <p className="text-sm text-muted-foreground">{user.public_repos} repositories</p>
              </div>
            </div>
          )}
        </motion.div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Eye size={16} />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <ChartBar size={16} />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Filters */}
            <motion.div 
              className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full md:w-40">
                    <FunnelSimple size={16} className="mr-2" />
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang!}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40">
                    <SortAscending size={16} className="mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Recently Updated</SelectItem>
                    <SelectItem value="created">Recently Created</SelectItem>
                    <SelectItem value="stars">Most Stars</SelectItem>
                    <SelectItem value="forks">Most Forks</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={fetchGitHubData} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </motion.div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredRepos.length} of {repos?.length || 0} repositories
            </div>

            {/* Repository Grid */}
            {isLoading ? (
              <LoadingGrid />
            ) : filteredRepos.length === 0 && (repos?.length || 0) > 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No repositories match your search criteria.</p>
              </div>
            ) : (
              <RepoGrid 
                repos={filteredRepos} 
                flippedCards={flippedCards}
                onCardFlip={handleCardFlip}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics repos={repos || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App