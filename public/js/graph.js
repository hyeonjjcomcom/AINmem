/*const data = [
    {
        "value": "DevelopedBy(Alibaba, wan_ai_2.2)",
        "description": "Wan AI 2.2는 알리바바가 개발했다.",
        "predicates": ["DevelopedBy"],
        "constants": ["Alibaba", "wan_ai_2.2"],
        "category": "wan_ai"
    },
    {
        "value": "is_VideoAI(wan_ai_2.2) ∧ is_OpenSource(wan_ai_2.2)",
        "description": "Wan AI 2.2는 비디오 AI 모델이며 오픈소스이다.",
        "predicates": ["is_VideoAI", "is_OpenSource"],
        "constants": ["wan_ai_2.2"],
        "category": "wan_ai"
    },
    {
        "value": "Adopts(wan_ai_2.2, MoE_Architecture)",
        "description": "Wan AI 2.2는 MoE 아키텍처를 채택했다.",
        "predicates": ["Adopts"],
        "constants": ["wan_ai_2.2", "MoE_Architecture"],
        "category": "wan_ai"
    },
    {
        "value": "Supports(wan_ai_2.2, T2IV_Task)",
        "description": "Wan AI 2.2는 T2IV 태스크를 지원한다.",
        "predicates": ["Supports"],
        "constants": ["wan_ai_2.2", "T2IV_Task"],
        "category": "wan_ai"
    },
    {
        "value": "has_GoodVideoGenerationAbility(wan_ai_2.2)",
        "description": "Wan AI 2.2는 준수한 비디오 생성 능력을 가졌다.",
        "predicates": ["has_GoodVideoGenerationAbility"],
        "constants": ["wan_ai_2.2"],
        "category": "wan_ai"
    },
    {
        "value": "∀x ∀y (User(x) ∧ Service(y, ArtanyAI) ∧ ¬PaysFor(x, y)) → ¬CanSeeResult(x, y)",
        "description": "Artany.ai 서비스에서는, 어떤 사용자든 작업에 대해 돈을 내지 않으면 그 결과물을 볼 수 없다.",
        "predicates": ["User", "Service", "PaysFor", "CanSeeResult"],
        "constants": ["ArtanyAI"],
        "category": "artany"
    },
    {
        "value": "FeelsNegativeAbout(TheUser, ArtanyAI_Service)",
        "description": "글을 작성한 사용자는 Artany.ai 서비스에 대해 부정적인 느낌을 받았다.",
        "predicates": ["FeelsNegativeAbout"],
        "constants": ["TheUser", "ArtanyAI_Service"],
        "category": "artany"
    },
    {
        "value": "∀u ∀m (AllowsTest(u, m)) → (BuildsTrust(u, m) ∧ IncreasesLikelihoodOfPayment(u))",
        "description": "어떤 사용자든 모델을 테스트할 수 있게 하면, 그 사용자는 모델을 신뢰하게 되고 결제할 가능성이 높아진다.",
        "predicates": ["AllowsTest", "BuildsTrust", "IncreasesLikelihoodOfPayment"],
        "constants": [],
        "category": "business"
    },
    {
        "value": "∀s ((isPaidService(s) ∧ Releases(OurCompany, s)) → ShouldProvideFreeTrial(OurCompany, s))",
        "description": "우리 회사가 유료 서비스를 공개할 때는 무료 체험을 제공해야 한다는 원칙을 제안한다.",
        "predicates": ["isPaidService", "Releases", "ShouldProvideFreeTrial"],
        "constants": ["OurCompany"],
        "category": "business"
    }
];*/

const data = [
    {
        "value": "달의 모양은 매일 달라진다",
        "description": "우리가 밤하늘에서 보는 달의 모양은 매일 조금씩 다르게 보인다.",
        "predicates": ["달라진다"],
        "constants": ["달","모양"],
        "category": "달의_변화"
    },
    {
        "value": "달은 지구 주위를 돈다",
        "description": "달은 약 한 달에 한 번 지구를 한 바퀴 돈다.",
        "predicates": ["돈다"],
        "constants": ["달", "지구"],
        "category": "달의_변화"
    },
    {
        "value": "달의 모양 변화는 태양빛과 관련이 있다",
        "description": "달이 지구를 돌면서 태양빛을 받는 부분이 달라지기 때문에 모양도 달라진다.",
        "predicates": ["관련이_있다"],
        "constants": ["달", "태양"],
        "category": "달의_변화"
    },
    {
        "value": "달의 모양은 초승달, 반달, 보름달, 그믐달처럼 변한다",
        "description": "달의 모양은 정해진 순서에 따라 여러 형태로 변화한다.",
        "predicates": ["변한다"],
        "constants": ["달","초승달", "반달", "보름달", "그믐달"],
        "category": "달의_변화"
    }
]


let currentFilter = 'all';
let nodes = new Map();
let links = [];
let simulation;
let showLabels = true;

const svg = d3.select("#graph");
const container = document.querySelector('.graph-container');
const width = Math.max(svg.node().getBoundingClientRect().width, 800);
const height = 600;

const color = d3.scaleOrdinal()
    .domain([1, 2])
    .range(['#ff6b6b', '#4ecdc4']);

function filterData() {
    if (currentFilter === 'all') return data;
    return data.filter(item => item.category === currentFilter);
}

function buildGraph() {
    const filteredData = filterData();
    nodes.clear();
    links.length = 0;

    // 노드 생성 (상수들)
    const allConstants = new Set();
    filteredData.forEach(item => {
        item.constants.forEach(constant => {
            if (constant !== 'x' && constant !== 'y' && constant !== 'u' && constant !== 'm' && constant !== 's') {
                allConstants.add(constant);
            }
        });
    });

    allConstants.forEach(constant => {
        nodes.set(constant, {
            id: constant,
            name: constant,
            type: 'constant',
            group: 1
        });
    });

    // 술어도 노드로 추가
    const allPredicates = new Set();
    filteredData.forEach(item => {
        item.predicates.forEach(predicate => {
            allPredicates.add(predicate);
        });
    });

    allPredicates.forEach(predicate => {
        nodes.set(predicate, {
            id: predicate,
            name: predicate,
            type: 'predicate',
            group: 2
        });
    });

    // 링크 생성
    filteredData.forEach(item => {
        item.predicates.forEach(predicate => {
            item.constants.forEach(constant => {
                if (constant !== 'x' && constant !== 'y' && constant !== 'u' && constant !== 'm' && constant !== 's') {
                    links.push({
                        source: predicate,
                        target: constant,
                        value: 1,
                        description: item.description
                    });
                }
            });
        });
    });

    // 통계 업데이트
    document.getElementById('node-count').textContent = nodes.size;
    document.getElementById('link-count').textContent = links.length;
}

function createGraph() {
    buildGraph();
    svg.selectAll("*").remove();

    simulation = d3.forceSimulation(Array.from(nodes.values()))
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(35));

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    const node = svg.append("g")
        .selectAll("g")
        .data(Array.from(nodes.values()))
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", d => d.type === 'constant' ? 18 : 24)
        .attr("fill", d => color(d.group));

    const nodeText = node.append("text")
        .text(d => d.name)
        .style("opacity", showLabels ? 1 : 0);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }).on("end", () => {
        // 시뮬레이션이 안정화되면 alpha를 0으로 설정
        simulation.alphaTarget(0);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    window.currentNodeText = nodeText;
}

function restart() {
    createGraph();
}

function toggleLabels() {
    showLabels = !showLabels;
    if (window.currentNodeText) {
        window.currentNodeText.style("opacity", showLabels ? 1 : 0);
    }
}

function centerGraph() {
    if (simulation) {
        simulation.alpha(0.3).restart();
    }
}

// 필터 이벤트 리스너
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', function() {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        createGraph();
    });
});

// 초기 그래프 생성
createGraph();

// 윈도우 리사이즈 시 그래프 업데이트
window.addEventListener('resize', () => {
    const newWidth = Math.max(svg.node().getBoundingClientRect().width, 800);
    if (simulation) {
        simulation.force("center", d3.forceCenter(newWidth / 2, height / 2));
        simulation.alpha(0.3).restart();
    }
});