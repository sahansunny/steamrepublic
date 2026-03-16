import { useEffect, useState, useMemo, useCallback } from 'react'
import './NeuralBackground.css'

interface NeuralNode {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  connections: number[]
}

export default function NeuralBackground() {
  const [nodes, setNodes] = useState<NeuralNode[]>([])

  // Reduce node count on mobile for better performance
  const nodeCount = useMemo(() => {
    return window.innerWidth < 768 ? 8 : 12
  }, [])

  const createNodes = useCallback(() => {
    const newNodes: NeuralNode[] = []
    
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3, // Reduced speed for smoother animation
        vy: (Math.random() - 0.5) * 0.3,
        connections: []
      })
    }
    
    // Create connections between nearby nodes (reduced connection distance)
    newNodes.forEach((node, i) => {
      newNodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          )
          if (distance < 150 && node.connections.length < 2) { // Reduced connections
            node.connections.push(j)
          }
        }
      })
    })
    
    setNodes(newNodes)
  }, [nodeCount])

  useEffect(() => {
    createNodes()

    // Reduced update frequency for better performance
    const interval = setInterval(() => {
      setNodes(prev => 
        prev.map(node => ({
          ...node,
          x: node.x + node.vx,
          y: node.y + node.vy,
          vx: node.x <= 0 || node.x >= window.innerWidth ? -node.vx : node.vx,
          vy: node.y <= 0 || node.y >= window.innerHeight ? -node.vy : node.vy
        }))
      )
    }, 80) // Increased interval for better performance

    return () => clearInterval(interval)
  }, [createNodes])

  return (
    <div className="neural-background">
      <svg className="neural-svg" width="100%" height="100%">
        {nodes.map(node => 
          node.connections.map(connectionId => {
            const connectedNode = nodes[connectionId]
            if (!connectedNode) return null
            
            return (
              <line
                key={`${node.id}-${connectionId}`}
                x1={node.x}
                y1={node.y}
                x2={connectedNode.x}
                y2={connectedNode.y}
                className="neural-connection"
              />
            )
          })
        )}
        {nodes.map(node => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="2" // Reduced size for better performance
            className="neural-node"
          />
        ))}
      </svg>
    </div>
  )
}