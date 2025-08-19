import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameState } from '@/lib/stores/useGameState';
import * as THREE from 'three';

interface NPCProps {
  position: [number, number, number];
  color: string;
  name: string;
  patrolArea?: { center: [number, number, number]; radius: number };
}

function NPC({ position, color, name, patrolArea }: NPCProps) {
  const ref = useRef<THREE.Group>(null);
  const { player } = useGameState();
  const targetPosition = useRef(new THREE.Vector3(...position));
  const changeDirectionTimer = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const npcPosition = ref.current.position;
    const playerPosition = player.position;

    // Check for collision with player and push away if too close
    const distance = npcPosition.distanceTo(playerPosition);
    if (distance < 2) {
      const pushDirection = npcPosition.clone().sub(playerPosition).normalize();
      pushDirection.y = 0; // Don't push vertically
      
      // Push NPC away from player gently
      const pushForce = 0.5;
      ref.current.position.add(pushDirection.multiplyScalar(pushForce * delta));
    }

    // Patrol behavior
    if (patrolArea) {
      const areaCenter = new THREE.Vector3(...patrolArea.center);
      const distanceToCenter = npcPosition.distanceTo(areaCenter);
      
      // If too far from patrol area, return to center
      if (distanceToCenter > patrolArea.radius) {
        targetPosition.current = areaCenter;
      } else {
        // Random patrol within area
        changeDirectionTimer.current += delta;
        if (changeDirectionTimer.current > 3) {
          const randomAngle = Math.random() * Math.PI * 2;
          const randomDistance = Math.random() * patrolArea.radius * 0.8;
          targetPosition.current = areaCenter.clone().add(
            new THREE.Vector3(
              Math.cos(randomAngle) * randomDistance,
              0,
              Math.sin(randomAngle) * randomDistance
            )
          );
          changeDirectionTimer.current = 0;
        }
      }

      // Move towards target
      const direction = targetPosition.current.clone().sub(npcPosition);
      direction.y = 0;
      
      if (direction.length() > 0.5) {
        direction.normalize();
        const moveSpeed = 1;
        ref.current.position.add(direction.multiplyScalar(moveSpeed * delta));
        
        // Face movement direction
        ref.current.lookAt(
          ref.current.position.x + direction.x,
          ref.current.position.y,
          ref.current.position.z + direction.z
        );
      }
    }
  });

  return (
    <group ref={ref} position={position} scale={[1.5, 1.5, 1.5]}>
      {/* Body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Eyes - Fixed to be bigger and positioned correctly */}
      <mesh position={[0.15, 2.05, 0.22]} castShadow>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.15, 2.05, 0.22]} castShadow>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.4, 1.4, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[0.4, 1.4, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

export default function NPCs() {
  return (
    <group>
      {/* Town center NPCs */}
      <NPC 
        position={[5, 0, 5]} 
        color="#FF6B6B" 
        name="townsperson1"
        patrolArea={{ center: [5, 0, 5], radius: 3 }}
      />
      <NPC 
        position={[-5, 0, -5]} 
        color="#4ECDC4" 
        name="townsperson2"
        patrolArea={{ center: [-5, 0, -5], radius: 4 }}
      />
      <NPC 
        position={[8, 0, -3]} 
        color="#45B7D1" 
        name="townsperson3"
        patrolArea={{ center: [8, 0, -3], radius: 2 }}
      />
      
      {/* Market area NPCs */}
      <NPC 
        position={[12, 0, -22]} 
        color="#96CEB4" 
        name="shopkeeper"
        patrolArea={{ center: [12, 0, -22], radius: 2 }}
      />
      <NPC 
        position={[6, 0, -20]} 
        color="#FFEAA7" 
        name="customer"
        patrolArea={{ center: [8, 0, -22], radius: 5 }}
      />
      
      {/* Park NPCs */}
      <NPC 
        position={[-12, 0, 15]} 
        color="#DDA0DD" 
        name="parkvisitor1"
        patrolArea={{ center: [-15, 0, 15], radius: 8 }}
      />
      <NPC 
        position={[18, 0, 12]} 
        color="#98D8C8" 
        name="parkvisitor2"
        patrolArea={{ center: [20, 0, 15], radius: 6 }}
      />
    </group>
  );
}