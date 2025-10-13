import { NextRequest, NextResponse } from 'next/server';
import { POLSimulation, simulationScenarios, ScenarioType } from '@/lib/pol-simulation';

// Store simulations in memory (in production, use Redis or database)
const simulations = new Map<string, POLSimulation>();

export async function POST(request: NextRequest) {
  try {
    const { action, simulationId, config, scenario } = await request.json();

    switch (action) {
      case 'create': {
        const id = crypto.randomUUID();
        const simulationConfig = config || {
          initialCapital: 1000000,
          tokenPrice: 100,
          volatility: 0.15,
          drift: 0.01,
          periods: 100
        };
        
        const simulation = new POLSimulation(simulationConfig);
        simulations.set(id, simulation);
        
        return NextResponse.json({
          success: true,
          simulationId: id,
          state: simulation.getState()
        });
      }

      case 'start': {
        if (!simulationId || !simulations.has(simulationId)) {
          return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
        }
        
        const simulation = simulations.get(simulationId)!;
        // Start simulation (this would be handled by WebSocket in real implementation)
        simulation.simulateMarketMovement(10);
        
        return NextResponse.json({
          success: true,
          state: simulation.getState()
        });
      }

      case 'step': {
        if (!simulationId || !simulations.has(simulationId)) {
          return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
        }
        
        const simulation = simulations.get(simulationId)!;
        simulation.simulateMarketMovement(1);
        
        return NextResponse.json({
          success: true,
          state: simulation.getState()
        });
      }

      case 'reset': {
        if (!simulationId || !simulations.has(simulationId)) {
          return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
        }
        
        const simulation = simulations.get(simulationId)!;
        simulation.reset();
        
        return NextResponse.json({
          success: true,
          state: simulation.getState()
        });
      }

      case 'apply_scenario': {
        if (!simulationId || !simulations.has(simulationId)) {
          return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
        }
        
        if (!scenario || !simulationScenarios[scenario as ScenarioType]) {
          return NextResponse.json({ error: 'Invalid scenario' }, { status: 400 });
        }
        
        const simulation = simulations.get(simulationId)!;
        const scenarioConfig = simulationScenarios[scenario as ScenarioType];
        
        // Create new simulation with scenario parameters
        const newConfig = {
          initialCapital: 1000000,
          tokenPrice: 100,
          volatility: scenarioConfig.volatility,
          drift: scenarioConfig.drift,
          periods: 100
        };
        
        const newSimulation = new POLSimulation(newConfig);
        simulations.set(simulationId, newSimulation);
        
        return NextResponse.json({
          success: true,
          state: newSimulation.getState(),
          scenario: scenarioConfig
        });
      }

      case 'update_liquidity_range': {
        if (!simulationId || !simulations.has(simulationId)) {
          return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
        }
        
        const { lowerBound, upperBound } = config;
        const simulation = simulations.get(simulationId)!;
        simulation.updateLiquidityRange(lowerBound, upperBound);
        
        return NextResponse.json({
          success: true,
          state: simulation.getState()
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const simulationId = searchParams.get('id');

    if (simulationId && simulations.has(simulationId)) {
      const simulation = simulations.get(simulationId)!;
      return NextResponse.json({
        success: true,
        state: simulation.getState()
      });
    }

    // Return available scenarios
    return NextResponse.json({
      success: true,
      scenarios: simulationScenarios,
      activeSimulations: Array.from(simulations.keys())
    });
  } catch (error) {
    console.error('Simulation GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const simulationId = searchParams.get('id');

    if (simulationId && simulations.has(simulationId)) {
      simulations.delete(simulationId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
  } catch (error) {
    console.error('Simulation DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}