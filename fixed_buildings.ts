import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useCursor } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameState } from '@/lib/stores/useGameState';

interface BuildingProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  name: string;
  onClick?: () => void;
  isUnlocked?: boolean;
}

function Building({ position, size, color, name, onClick, isUnlocked = true }: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  useCursor(hovered);

  // Physics body for collision
  const [ref] = useBox(() => ({
    position,
    args: size,
    type: 'Static',
  }));

  return (
    <group>
      {/* Main building */}
      <mesh
        ref={ref}
        position={position}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setClicked(true);
          setTimeout(() => setClicked(false), 200);
          if (onClick && isUnlocked) {
            onClick();
          }
        }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={hovered ? (isUnlocked ? '#ffff88' : '#ff8888') : color}
          transparent={false}
          opacity={1.0}
          emissive={clicked ? '#333333' : '#000000'}
        />
      </mesh>

      {/* Building name */}
      <Text
        position={[position[0], position[1] + size[1]/2 + 1, position[2]]}
        fontSize={1}
        color={isUnlocked ? 'white' : 'red'}
        anchorX="center"
        anchorY="middle"
      >
        {name} {!isUnlocked ? '🔒' : ''}
      </Text>

      {/* Door */}
      <mesh position={[position[0], position[1] - size[1]/2 + 1, position[2] + size[2]/2]} castShadow>
        <boxGeometry args={[1, 2, 0.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Door handle */}
      <mesh position={[position[0] + 0.3, position[1] - size[1]/2 + 0.5, position[2] + size[2]/2 + 0.1]} castShadow>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

function InteriorView({ buildingName, onExit }: { buildingName: string; onExit: () => void }) {
  const { camera } = useThree();
  
  // Set camera position for interior view
  useFrame(() => {
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
  });

  const interiors = {
    House: (
      <group>
        {/* Living room furniture */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2.8, 0.4, 1.3]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>
        
        {/* TV */}
        <mesh position={[0, 2, -3]} castShadow>
          <boxGeometry args={[2, 1.2, 0.2]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 2, -2.9]} castShadow>
          <boxGeometry args={[1.8, 1, 0.1]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
        
        {/* Kitchen table */}
        <mesh position={[-4, 1, -2]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>
        <mesh position={[-4, 0.5, -2]} castShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Stairs */}
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[3, 0.1 + i * 0.2, -1 + i * 0.3]} castShadow receiveShadow>
            <boxGeometry args={[1, 0.2, 0.3]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))}
        
        {/* NPC */}
        <group position={[-2, 0, 0]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.6, 1.2, 0.4]} />
            <meshStandardMaterial color="#4ECDC4" />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color="#fdbcb4" />
          </mesh>
          <mesh position={[0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      </group>
    ),
    
    Office: (
      <group>
        {/* Desk */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.1, 1.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.8, 1, 1.3]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        
        {/* Computer */}
        <mesh position={[0, 1.3, -0.5]} castShadow>
          <boxGeometry args={[1, 0.6, 0.1]} />
          <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        <mesh position={[0, 1.05, -0.4]} castShadow>
          <boxGeometry args={[0.8, 0.05, 0.8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Office chair */}
        <mesh position={[0, 0.8, 1.5]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 1.6, 1.3]} castShadow>
          <boxGeometry args={[0.8, 1, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Filing cabinets */}
        <mesh position={[-3, 1, -2]} castShadow receiveShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
        <mesh position={[3, 1, -2]} castShadow receiveShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
        
        {/* Office NPC */}
        <group position={[-1, 0, -1]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.6, 1.2, 0.4]} />
            <meshStandardMaterial color="#0000FF" />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color="#fdbcb4" />
          </mesh>
          <mesh position={[0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      </group>
    ),
    
    School: (
      <group>
        {/* Classroom desks */}
        {[0, 1, 2].map(row => (
          <group key={row}>
            {[-1.5, 0, 1.5].map((x, col) => (
              <group key={col}>
                <mesh position={[x, 0.8, -2 + row * 1.5]} castShadow receiveShadow>
                  <boxGeometry args={[1, 0.1, 0.6]} />
                  <meshStandardMaterial color="#DEB887" />
                </mesh>
                <mesh position={[x, 0.4, -2 + row * 1.5]} castShadow>
                  <boxGeometry args={[0.9, 0.8, 0.5]} />
                  <meshStandardMaterial color="#8B4513" />
                </mesh>
                <mesh position={[x, 0.6, -1.5 + row * 1.5]} castShadow>
                  <boxGeometry args={[0.8, 0.8, 0.1]} />
                  <meshStandardMaterial color="#8B4513" />
                </mesh>
              </group>
            ))}
          </group>
        ))}
        
        {/* Blackboard */}
        <mesh position={[0, 2, -4]} castShadow>
          <boxGeometry args={[4, 2, 0.1]} />
          <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        
        {/* Teacher's desk */}
        <mesh position={[0, 1, 2]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.1, 1.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 0.5, 2]} castShadow>
          <boxGeometry args={[2.3, 1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Teacher NPC */}
        <group position={[-1, 0, 3]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.6, 1.2, 0.4]} />
            <meshStandardMaterial color="#8B008B" />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color="#fdbcb4" />
          </mesh>
          <mesh position={[0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      </group>
    ),
    
    TownHall: (
      <group>
        {/* Grand staircase */}
        {[0, 1, 2, 3, 4].map(i => (
          <mesh key={i} position={[0, i * 0.3, -2 + i * 0.4]} castShadow receiveShadow>
            <boxGeometry args={[4 - i * 0.3, 0.3, 0.8]} />
            <meshStandardMaterial color="#DC143C" />
          </mesh>
        ))}
        
        {/* Reception desk */}
        <mesh position={[0, 1.2, 1]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.6, 1]} castShadow>
          <cylinderGeometry args={[1.3, 1.3, 1.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        
        {/* Pillars */}
        {[[-3, 0, 0], [3, 0, 0], [-3, 0, -4], [3, 0, -4]].map((pos, i) => (
          <mesh key={i} position={pos} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 6]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
        ))}
        
        {/* Mayor NPC */}
        <group position={[1, 0, 2]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.6, 1.2, 0.4]} />
            <meshStandardMaterial color="#800080" />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color="#fdbcb4" />
          </mesh>
          <mesh position={[0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      </group>
    ),
    
    Restaurant: (
      <group>
        {/* Tables and chairs */}
        {[[-2, 0, -2], [2, 0, -2], [-2, 0, 1], [2, 0, 1]].map((pos, i) => (
          <group key={i}>
            <mesh position={pos} castShadow receiveShadow>
              <cylinderGeometry args={[0.8, 0.8, 0.1]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[pos[0], 0.4, pos[2]]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.8]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            {/* Chairs around table */}
            {[[0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8]].map((offset, j) => (
              <group key={j}>
                <mesh position={[pos[0] + offset[0], 0.4, pos[2] + offset[1]]} castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 0.8]} />
                  <meshStandardMaterial color="#654321" />
                </mesh>
                <mesh position={[pos[0] + offset[0], 0.8, pos[2] + offset[1] - 0.2]} castShadow>
                  <boxGeometry args={[0.4, 0.6, 0.1]} />
                  <meshStandardMaterial color="#654321" />
                </mesh>
              </group>
            ))}
          </group>
        ))}
        
        {/* Kitchen counter */}
        <mesh position={[0, 1, 3]} castShadow receiveShadow>
          <boxGeometry args={[5, 0.2, 1]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        <mesh position={[0, 0.5, 3]} castShadow>
          <boxGeometry args={[4.8, 1, 0.8]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
        
        {/* Stove */}
        <mesh position={[-1.5, 1.3, 3]} castShadow>
          <boxGeometry args={[1, 0.2, 0.8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {[[-0.2, 0], [0.2, 0]].map((offset, i) => (
          <mesh key={i} position={[-1.5 + offset[0], 1.4, 3 + offset[1]]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial color="#FF4500" />
          </mesh>
        ))}
        
        {/* Chef NPC */}
        <group position={[1, 0, 4]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.6, 1.2, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color="#fdbcb4" />
          </mesh>
          <mesh position={[0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.15, 2.05, 0.22]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          {/* Chef hat */}
          <mesh position={[0, 2.4, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.2, 0.6]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      </group>
    )
  };

  return (
    <group>
      {/* Interior lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={0.8} />
      
      {/* Floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 3, -6]} castShadow>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>
      <mesh position={[-6, 3, 0]} castShadow>
        <boxGeometry args={[0.2, 6, 12]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>
      <mesh position={[6, 3, 0]} castShadow>
        <boxGeometry args={[0.2, 6, 12]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>
      <mesh position={[0, 3, 6]} castShadow>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 6, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Exit door */}
      <mesh 
        position={[0, 2, 5.8]} 
        castShadow
        onClick={onExit}
        onPointerOver={() => useCursor(true)}
        onPointerOut={() => useCursor(false)}
      >
        <boxGeometry args={[1.5, 4, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Interior content */}
      {interiors[buildingName as keyof typeof interiors]}
    </group>
  );
}

export default function Buildings() {
  const { 
    unlockedBuildings, 
    startMinigame, 
    enterBuilding, 
    exitBuilding, 
    phase, 
    player 
  } = useGameState();

  const handleBuildingClick = (buildingName: string) => {
    if (unlockedBuildings.has(buildingName)) {
      enterBuilding(buildingName);
    } else {
      startMinigame(buildingName);
    }
  };

  // Don't render buildings in interior view
  if (phase === 'interior') {
    return (
      <InteriorView 
        buildingName={player.inBuilding!} 
        onExit={exitBuilding}
      />
    );
  }

  return (
    <group>
      {/* House */}
      <Building
        position={[-20, 4, -20]}
        size={[8, 8, 6]}
        color="#FF6B6B"
        name="House"
        onClick={() => handleBuildingClick('House')}
        isUnlocked={unlockedBuildings.has('House')}
      />

      {/* Office Building */}
      <Building
        position={[25, 6, -25]}
        size={[8, 12, 8]}
        color="#4ECDC4"
        name="Office"
        onClick={() => handleBuildingClick('Office')}
        isUnlocked={unlockedBuildings.has('Office')}
      />

      {/* School */}
      <Building
        position={[-30, 5, 20]}
        size={[12, 10, 8]}
        color="#95E1D3"
        name="School"
        onClick={() => handleBuildingClick('School')}
        isUnlocked={unlockedBuildings.has('School')}
      />

      {/* Town Hall */}
      <Building
        position={[20, 8, 25]}
        size={[10, 16, 10]}
        color="#F38BA8"
        name="TownHall"
        onClick={() => handleBuildingClick('TownHall')}
        isUnlocked={unlockedBuildings.has('TownHall')}
      />

      {/* Restaurant */}
      <Building
        position={[15, 4, -22]}
        size={[10, 8, 6]}
        color="#FFEAA7"
        name="Restaurant"
        onClick={() => handleBuildingClick('Restaurant')}
        isUnlocked={unlockedBuildings.has('Restaurant')}
      />
    </group>
  );
}