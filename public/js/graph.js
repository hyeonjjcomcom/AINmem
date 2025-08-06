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
    .domain(['predicate', 'entity'])
    .range(['#ff6b6b', '#4ecdc4']);

function navigateToPage(url) {
    window.location.href = url;
}

// 네비게이션 메뉴 활성화 처리
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        // 현재 페이지(Graph)가 아닌 경우에만 네비게이션
        if (!item.classList.contains('active')) {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        }
    });
});

function filterData(data) {
    // category 필드가 없으므로 일단 모든 데이터 반환
    return data;
}

async function buildGraph() {
    const data = await fetch('/facts')
        .then(async (res) => {
            return await res.json();
        });
    const filteredData = filterData(data);

    console.log('📊 Building graph with data:', filteredData);
    nodes.clear();
    links.length = 0;

    // constant의 등장 횟수 추적
    const constantCount = new Map();

    // 먼저 모든 constants를 수집하고 등장 횟수 계산
    filteredData.forEach(item => {
        item.constants.forEach(constant => {
            if (constant !== 'x' && constant !== 'y' && constant !== 'u' && constant !== 'm' && constant !== 's') {
                constantCount.set(constant, (constantCount.get(constant) || 0) + 1);
            }
        });
    });

    // constant 노드 생성 - 중요: 객체로 생성해야 함
    constantCount.forEach((count, constant) => {
        nodes.set(constant, {
            id: constant,
            name: constant,
            type: 'constant',
            count: count,
            group: 1
        });
    });

    // 링크 생성 (constants 간의 연결) - 중복 간선 처리
    const linkMap = new Map();
    
    filteredData.forEach(item => {
        const validConstants = item.constants.filter(c => 
            c !== 'x' && c !== 'y' && c !== 'u' && c !== 'm' && c !== 's'
        );
        
        // 이항 관계의 경우 (예: IsCultivarOf(aori_cultivar, apple))
        if (validConstants.length >= 2) {
            // 첫 번째 상수를 중심으로 다른 모든 상수와 연결
            const sourceConstant = validConstants[0];
            for (let i = 1; i < validConstants.length; i++) {
                const targetConstant = validConstants[i];
                
                // 링크 키 생성 (양방향 고려하여 정렬)
                const linkKey = [sourceConstant, targetConstant].sort().join('-');
                
                if (!linkMap.has(linkKey)) {
                    linkMap.set(linkKey, {
                        source: sourceConstant,
                        target: targetConstant,
                        predicates: [],
                        descriptions: [],
                        values: [],
                        count: 0
                    });
                }
                
                const link = linkMap.get(linkKey);
                link.predicates.push(item.predicates[0] || 'unknown');
                link.descriptions.push(item.description || '');
                link.values.push(item.value || '');
                link.count++;
            }
        }
    });
    
    // Map에서 배열로 변환
    links = Array.from(linkMap.values());

    // 통계 업데이트
    document.getElementById('node-count').textContent = nodes.size;
    document.getElementById('link-count').textContent = links.length;
}

function createGraph() {
    buildGraph().then(() => {
        svg.selectAll("*").remove();

        // 노드 배열 생성 - 중요: Map의 values를 배열로 변환
        const nodeArray = Array.from(nodes.values());
        
        console.log('노드 배열:', nodeArray);
        console.log('링크 배열:', links);

        // 노드 크기 스케일 (등장 횟수에 따라)
        const maxCount = Math.max(...nodeArray.map(n => n.count));
        const radiusScale = d3.scaleLinear()
            .domain([1, maxCount])
            .range([15, 30]);

        // force simulation 생성
        simulation = d3.forceSimulation(nodeArray)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(d => radiusScale(d.count) + 10));

        // 링크 두께 스케일 (관계 개수에 따라)
        const maxLinkCount = Math.max(...links.map(l => l.count));
        const strokeWidthScale = d3.scaleLinear()
            .domain([1, maxLinkCount])
            .range([1.5, 8]);

        // 링크 그리기
        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => strokeWidthScale(d.count))
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                showLinkDetails(d);
            });

        // 링크 라벨 (관계 개수 표시)
        const linkLabel = svg.append("g")
            .selectAll("text")
            .data(links)
            .enter().append("text")
            .attr("class", "link-label")
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "#666")
            .text(d => d.count > 1 ? `${d.count} relations` : d.predicates[0])
            .style("opacity", showLabels ? 1 : 0)
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                showLinkDetails(d);
            });

        // 노드 그리기
        const node = svg.append("g")
            .selectAll("g")
            .data(nodeArray)
            .enter().append("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => color(d.type))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        // 노드 라벨
        const nodeText = node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .text(d => d.name)
            .style("opacity", showLabels ? 1 : 0);

        // 시뮬레이션 tick 이벤트
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
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

        // 전역 변수에 저장
        window.currentNodeText = nodeText;
        window.currentLinkLabel = linkLabel;
    });
}

function restart() {
    createGraph();
}

function toggleLabels() {
    showLabels = !showLabels;
    if (window.currentNodeText) {
        window.currentNodeText.style("opacity", showLabels ? 1 : 0);
    }
    if (window.currentLinkLabel) {
        window.currentLinkLabel.style("opacity", showLabels ? 1 : 0);
    }
}

function centerGraph() {
    if (simulation) {
        simulation.alpha(0.3).restart();
    }
}

// 링크 상세 정보 표시 함수
function showLinkDetails(linkData) {
    const modal = document.getElementById('link-modal');
    const modalContent = document.getElementById('modal-relations');
    
    // 관계 목록 생성
    let relationsHTML = '';
    linkData.predicates.forEach((predicate, index) => {
        relationsHTML += `
            <div class="relation-item">
                <h4>${predicate}</h4>
                <p><strong>Description:</strong> ${linkData.descriptions[index]}</p>
                <p><strong>Formula:</strong> ${linkData.values[index]}</p>
            </div>
        `;
    });
    
    modalContent.innerHTML = `
        <h3>Relations between ${linkData.source.name || linkData.source} and ${linkData.target.name || linkData.target}</h3>
        <p><strong>Total Relations:</strong> ${linkData.count}</p>
        <div class="relations-list">
            ${relationsHTML}
        </div>
    `;
    
    modal.style.display = 'block';
}

// 모달 닫기 함수
function closeLinkModal() {
    const modal = document.getElementById('link-modal');
    modal.style.display = 'none';
}

// 필터 이벤트 리스너 - category 필드가 없으므로 일단 비활성화
/*
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', function() {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        createGraph();
    });
});
*/

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