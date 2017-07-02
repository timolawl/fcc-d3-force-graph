
//cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js

// FCC: Show Relationships with a Force Directed Graph
// User Story: I can see a Force-directed Graph that shows which campers are posting links on Camper News to which domains.
// User Story: I can see each camper's icon on their node.
// User Story: I can see the relationship between the campers and the domains they're posting.
// User Story: I can tell approximately many times campers have linked to a specific domain from it's node size.
// User Story: I can tell approximately how many times a specific camper has posted a link from their node's size.

var Chart = (function(window, d3) {
  var url = 'https://www.freecodecamp.com/news/hot';
  var index = 0, data, force, svg, chartWrapper, title, div, hoverTitle, hoverPosts, links, nodes, image, legend, author, domain, link, circle, drag, node, margin, height, width;
  
  d3.json(url, init);
  
  function init(json) {
    
    links = []; // source: user target: domain
    nodes = []; // name picture postScore link linkScore 
    
    function extractDomain(url) {
      var domain;
      
      if (url.indexOf('://') > -1)
        domain = url.split('/')[2];
      else domain = url.split('/')[0];
      
      domain = domain.split(':')[0];
    
      return domain;   
    }
    
    
    
    json.forEach(function(article) {
      var name = '', avatar = '', postScore = 0, link = '', linkScore = 0, linkPair = [], source = '', target = '';
      var domain = extractDomain(article.link);
      
      var nameIndex = nodes.map(function(node) { return node.name; }).indexOf(article.author.username);
      var linkIndex = nodes.map(function(node) { return node.link; }).indexOf(domain);
      
      // if name does not already exist
      if (nameIndex === -1) {
        name = article.author.username;
        avatar = article.author.picture;
        postScore = 1;
        
        nodes.push({
          index: index++,
          name: name,
          avatar: avatar,
          postScore: postScore,
          link: '',
          linkScore: 0
        });
        
        target = nodes[nodes.length - 1].index; // most recent one
        
      }
      else {
        nodes[nameIndex].postScore++;
        target = nodes[nameIndex].index;
      }
      
      // if link does not already exist
      if (linkIndex === -1) {
        link = domain;
        linkScore = 1;
        
        nodes.push({
          index: index++,
          name: '',
          avatar: '',
          postScore: 0,
          link: link,
          linkScore: linkScore
        });
        
        source = nodes[nodes.length - 1].index;
        
      }
      else {
        nodes[linkIndex].linkScore++;
        source = nodes[linkIndex].index;
      }
      
      
      // check links array if source target pair already exists
      linkPair = links.filter(function(object) {
        if (object.source === source && object.target === target)
           return true;
      });
      
      if(linkPair.length === 0) {
        links.push({
          source: source,
          target: target,
          value: 1
        });
      }
        
    });
    
    data = json;
  
    force = d3.layout.force()
      .nodes(nodes) // need to make the array of nodes and links
      .links(links)
      .charge(-120)
      .linkDistance(60);
    
    svg = d3.select('.chart').append('svg');
    
    chartWrapper = svg.append('g');
    
    chartWrapper.append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'middle')
      .text('Camper News Force-Directed Graph');
    
    div = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
    
    link = chartWrapper.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link');
    
    drag = force.drag()
      .on('dragstart', function() { circle.attr('class', 'circle--grabbing'); })
      .on('drag', function() { circle.attr('class', 'circle--grabbing'); })
      .on('dragend', function() { circle.attr('class', 'circle'); });
    
    circle = chartWrapper.selectAll('.circle')
      .data(nodes).enter().append('g')
      .attr('class', 'circle')
      .call(drag);
    
    
    node = circle.append('circle')
      .attr('class', function(d) {
      if(d.name === '')
        return 'node node--link';
      else return 'node node--author';
    });

    circle.on('mousemove', function(d) {
      if (this.firstChild.classList.contains('node--link'))
        div.attr('class', 'tooltip active--link');
     //   d3.select(this).attr('class', 'circle active--link');
      else if (this.firstChild.classList.contains('node--author'))
        div.attr('class', 'tooltip active--author');
   //     d3.select(this).attr('class', 'circle active--author');      
   //   d3.select(this).attr('class', 'circle active');
      div.transition()
        .duration(200)
        .style('opacity', 0.9);
      
      if (d.name)
        hoverTitle = d.name;
      else hoverTitle = d.link;
      
      if (d.postScore)
        hoverPosts = d.postScore;
      else hoverPosts = d.linkScore;
        
      
      div.html('<span>' + hoverTitle + '</span><br><span>Posts: ' + hoverPosts + '</span>');
      div.style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY) + 'px');
    })
    .on('mouseout', function(d) {
      d3.select(this).attr('class', 'circle');
      div.transition()
        .duration(500)
        .style('opacity', 0);
    });
    
    image = circle.append('svg:image')
      .attr('class', 'image')
      .attr('xlink:href', function(d) { return d.avatar; })
      .attr('width', 20)
      .attr('height', 20);
    
    legend = chartWrapper.append('g')
      .attr('class', 'legend');
    
    author = legend.append('g')
      .attr('class', 'legend legend--author');
    
    author.append('rect')
      .attr('class', 'legend legend--color legend--author-color')
      .attr('height', '20px')
      .attr('width', '20px')
    
    author.append('text')
      .attr('class', 'legend legend--text')
      .attr('text-anchor', 'start')
      .text('Author');
    

    domain = legend.append('g')
      .attr('class', 'legend legend--domain');
    
    domain.append('rect')
      .attr('class', 'legend legend--color legend--domain-color')
      .attr('height', '20px')
      .attr('width', '20px')
    
    domain.append('text')
      .attr('class', 'legend legend--text')
      .attr('text-anchor', 'start')
      .text('Domain');
    
    render(); 
  }
  
  function render() {
    updateDimensions();
    /*
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(nodes);
      return function(d) {
        var padding = 1;
        var radius = d.linkScore === 0 ? (d.postScore + 15) : d.linkScore * 2 + 5;
        var rb = 2 * radius + padding,
            nx1 = d.x - rb,
            nx2 = d.x + rb,
            ny1 = d.y - rb,
            ny2 = d.y + rb;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y);
          //      rb = radius + quad.point.radius;
            if (l < rb) {
              l = (l - rb) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }
    */
    
    svg.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    chartWrapper.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
       
    force.size([width, height]);
    
    force.on('tick', function() {
      link.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
      
      node.attr('r', function(d) { return d.linkScore === 0 ? (d.postScore + 15) : d.linkScore * 2 + 5; })
        .attr('cx', function(d) { var radius = d.linkScore === 0 ? (d.postScore + 15) : d.linkScore * 2 + 5; return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr('cy', function(d) { var radius = d.linkScore === 0 ? (d.postScore + 15) : d.linkScore * 2 + 5; return d.y = Math.max(radius, Math.min(height - radius, d.y)); });     
      
   //   node.each(collide(0.5));
      
      image.attr('x', function(d) { return d.x - 10; })
        .attr('y', function(d) { return d.y - 10; });    
      
   //   image.each(collide(0.5));
      
      chartWrapper.select('.title')
        .attr('x', width/2)
        .attr('y', height/2)
      
      chartWrapper.selectAll('.legend--color')
        .attr('x', width - 100)
        .attr('y', height - 60);
      
      chartWrapper.selectAll('.legend--text')
        .attr('x', width - 100 + 25)
        .attr('y', height - 60 + 14);
      
      chartWrapper.select('.legend--domain')
        .attr('transform', 'translate(0' + ',' + 25 + ')');
      
      
    });
    
    force.start();
    
  }
  
  function updateDimensions() {
    margin = {top: 0, right: 8, bottom: 8, left: 0};
    
    height = window.innerHeight * 0.8 - margin.top - margin.bottom;
    width = window.innerWidth * 0.8 - margin.left - margin.right;
  }
  
  return {
    render: render
  }
  
})(window, d3);

window.addEventListener('resize', Chart.render);
