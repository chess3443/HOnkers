import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useCannon } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameState } from '@/lib/stores/useGameState';
import { useAudio } from '@/lib/stores/useAudio';

export default function Player() {
  const { camera } = useThree();
  const [, get] = useKeyboardControls();
  const { playSound } = useAudio();
  const {
    player,
    setPlayerPosition,
    phase,
    targetPosition,
    clearTargetPosition,
    addInventoryItem,
    inventory,
  } = useGameState();

  const playerRef = useRef<THREE.Mesh>(null);
  const velocity = useRef([0, 0, 0]);
  const [lastHonkTime, setLastHonkTime] = useState(0);

  // Physics body for the player
  const [ref, api] = useCannon(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [player.position.x, player.position.y, player.position.z],
    args: [1, 1, 1.5], // Box shape for collision
    material: {
      friction: 0.1,
      restitution: 0.1,
    },
  }));

  // Subscribe to velocity changes
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => {
      velocity.current = v;
    });
    return unsubscribe;
  }, [api]);

  // Subscribe to position changes and update game state
  useEffect(() => {
    const unsubscribe = api.position.subscribe((position) => {
      setPlayerPosition(new THREE.Vector3(position[0], position[1], position[2]));
    });
    return unsubscribe;
  }, [api, setPlayerPosition]);

  useFrame((state, delta) => {
    if (phase !== 'playing' && phase !== 'interior') return;

    const { forward, backward, leftward, rightward, run, honk } = get();

    // Handle honking with debouncing
    if (honk && Date.now() - lastHonkTime > 500) {
      playSound('success');
      setLastHonkTime(Date.now());
    }

    // Calculate movement direction
    const moveVector = new THREE.Vector3(0, 0, 0);
    const speed = run ? 8 : 4;

    if (forward) moveVector.z -= 1;
    if (backward) moveVector.z += 1;
    if (leftward) moveVector.x -= 1;
    if (rightward) moveVector.x += 1;

    // Handle automatic movement to target position
    if (targetPosition) {
      const direction = targetPosition.clone().sub(player.position);
      direction.y = 0; // Don't move vertically for auto-movement
      
      if (direction.length() < 1) {
        // Reached target
        clearTargetPosition();
        api.velocity.set(0, velocity.current[1], 0);
      } else {
        // Move towards target
        direction.normalize();
        api.velocity.set(direction.x * speed, velocity.current[1], direction.z * speed);
      }
    } else if (moveVector.length() > 0) {
      // Manual movement
      moveVector.normalize();
      
      // Apply movement with collision detection
      const newVelocity = [
        moveVector.x * speed,
        velocity.current[1], // Preserve Y velocity for gravity
        moveVector.z * speed,
      ];
      
      api.velocity.set(newVelocity[0], newVelocity[1], newVelocity[2]);
    } else {
      // Stop horizontal movement, preserve vertical for gravity
      api.velocity.set(0, velocity.current[1], 0);
    }

    // Update camera to follow player
    if (playerRef.current) {
      const idealPosition = player.position.clone().add(new THREE.Vector3(0, 8, 8));
      camera.position.lerp(idealPosition, delta * 2);
      camera.lookAt(player.position);
    }

    // Collect nearby items
    const nearbyItems = ['pineapple', 'apple', 'carrot'].filter(item => {
      const itemPos = new THREE.Vector3(
        item === 'pineapple' ? 0 : item === 'apple' ? -15 : 10,
        0.5,
        item === 'pineapple' ? 0 : item === 'apple' ? 5 : -10
      );
      return player.position.distanceTo(itemPos) < 2 && !inventory.includes(item);
    });

    nearbyItems.forEach(item => {
      addInventoryItem(item);
      playSound('success');
    });
  });

  if (phase === 'interior') {
    return null; // Don't render player in interior view
  }

  return (
    <mesh ref={ref} castShadow receiveShadow position={[player.position.x, player.position.y, player.position.z]}>
      {/* Goose body */}
      <group>
        {/* Main body */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#f8f8ff" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.5, -1]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#f8f8ff" />
        </mesh>
        
        {/* Beak */}
        <mesh position={[0, 0.3, -1.5]} castShadow>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshStandardMaterial color="#ff8c00" />
        </mesh>
        
        {/* Eyes - Fixed to be bigger and black */}
        <mesh position={[-0.2, 0.6, -1.3]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.2, 0.6, -1.3]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Wings */}
        <mesh position={[-0.7, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
          <sphereGeometry args={[0.4, 8, 16]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        <mesh position={[0.7, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
          <sphereGeometry args={[0.4, 8, 16]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Tail */}
        <mesh position={[0, 0.2, 0.8]} castShadow>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Feet */}
        <mesh position={[-0.3, -0.8, -0.2]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ff8c00" />
        </mesh>
        <mesh position={[0.3, -0.8, -0.2]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ff8c00" />
        </mesh>

        {/* Pineapple hat when in free roam mode */}
        {phase === 'freeRoam' && (
          <group position={[0, 1, -0.5]}>
            {/* Pineapple body */}
            <mesh>
              <cylinderGeometry args={[0.3, 0.4, 0.8, 8]} />
              <meshStandardMaterial color="#DAA520" />
            </mesh>
            {/* Pineapple top leaves */}
            {[...Array(8)].map((_, i) => (
              <mesh key={i} position={[
                Math.cos(i * Math.PI / 4) * 0.2,
                0.6,
                Math.sin(i * Math.PI / 4) * 0.2
              ]} rotation={[0, i * Math.PI / 4, 0]}>
                <coneGeometry args={[0.05, 0.4, 4]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </mesh>
  );
}