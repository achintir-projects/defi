import { Server as ServerIO } from 'socket.io';
import { POLSimulation, simulationScenarios } from '@/lib/pol-simulation';

const simulations = new Map<string, POLSimulation>();

export function setupSocket(io: ServerIO) {
  console.log('Setting up Socket.IO handlers');

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Create new simulation
    socket.on('create_simulation', (config) => {
      const simulationId = socket.id;
      const simulationConfig = config || {
        initialCapital: 1000000,
        tokenPrice: 100,
        volatility: 0.15,
        drift: 0.01,
        periods: 100
      };
      
      const simulation = new POLSimulation(simulationConfig);
      simulations.set(simulationId, simulation);
      
      // Set up real-time updates
      simulation.onStateChange((state) => {
        socket.emit('simulation_update', state);
      });
      
      socket.emit('simulation_created', {
        simulationId,
        state: simulation.getState()
      });
    });

    // Start simulation
    socket.on('start_simulation', () => {
      const simulation = simulations.get(socket.id);
      if (simulation) {
        // Start continuous simulation
        const interval = setInterval(() => {
          simulation.simulateMarketMovement(1);
        }, 1000);
        
        socket.on('stop_simulation', () => {
          clearInterval(interval);
        });
        
        socket.on('disconnect', () => {
          clearInterval(interval);
          simulations.delete(socket.id);
        });
      }
    });

    // Step simulation
    socket.on('step_simulation', () => {
      const simulation = simulations.get(socket.id);
      if (simulation) {
        simulation.simulateMarketMovement(1);
      }
    });

    // Reset simulation
    socket.on('reset_simulation', () => {
      const simulation = simulations.get(socket.id);
      if (simulation) {
        simulation.reset();
      }
    });

    // Apply scenario
    socket.on('apply_scenario', (scenarioName: string) => {
      const simulation = simulations.get(socket.id);
      if (simulation && simulationScenarios[scenarioName as keyof typeof simulationScenarios]) {
        const scenario = simulationScenarios[scenarioName as keyof typeof simulationScenarios];
        const newConfig = {
          initialCapital: 1000000,
          tokenPrice: 100,
          volatility: scenario.volatility,
          drift: scenario.drift,
          periods: 100
        };
        
        const newSimulation = new POLSimulation(newConfig);
        simulations.set(socket.id, newSimulation);
        
        newSimulation.onStateChange((state) => {
          socket.emit('simulation_update', state);
        });
        
        socket.emit('scenario_applied', {
          scenario,
          state: newSimulation.getState()
        });
      }
    });

    // Update liquidity range
    socket.on('update_liquidity_range', ({ lowerBound, upperBound }) => {
      const simulation = simulations.get(socket.id);
      if (simulation) {
        simulation.updateLiquidityRange(lowerBound, upperBound);
      }
    });

    // Add liquidity
    socket.on('add_liquidity', ({ poolId, amount }) => {
      const simulation = simulations.get(socket.id);
      if (simulation) {
        simulation.addLiquidity(poolId, amount);
      }
    });

    // Remove liquidity
    socket.on('remove_liquidity', ({ poolId, amount }) => {
      const simulation = simulations.get(socket.id);
      if (simulation) {
        simulation.removeLiquidity(poolId, amount);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      simulations.delete(socket.id);
    });
  });
}