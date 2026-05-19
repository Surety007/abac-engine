import {
  ABACEngine,
  AttributeRef,
  CombiningAlgorithm,
  ComparisonOperator,
  ConditionBuilder,
  Decision,
  Effect,
  PolicyBuilder
} from '../../src/abac';
import type { ABACPolicy, ABACRequest } from '../../src/abac/types';

const readRequest: ABACRequest = {
  subject: {
    id: 'user-1',
    attributes: {
      active: false,
      department: 'legal',
      emptyCode: ''
    }
  },
  resource: {
    id: 'resource-1',
    type: 'document',
    attributes: {
      attempts: 0
    }
  },
  action: {
    id: 'read',
    attributes: {
      dryRun: false
    }
  }
};

describe('Phase 8 engine regressions', () => {
  it('evaluates first-applicable policies by descending priority and skips NotApplicable results', async () => {
    const highestPriorityNonMatch = PolicyBuilder.create('highest-priority-non-match')
      .version('1.0.0')
      .deny()
      .priority(10000)
      .condition(ConditionBuilder.equals(AttributeRef.action('id'), 'delete'))
      .build();

    const mediumPriorityPermit = PolicyBuilder.create('medium-priority-permit')
      .version('1.0.0')
      .permit()
      .priority(5000)
      .condition(ConditionBuilder.equals(AttributeRef.action('id'), 'read'))
      .build();

    const lowPriorityDeny = PolicyBuilder.create('low-priority-deny')
      .version('1.0.0')
      .deny()
      .priority(100)
      .condition(ConditionBuilder.equals(AttributeRef.action('id'), 'read'))
      .build();

    const engine = new ABACEngine({
      combiningAlgorithm: CombiningAlgorithm.FirstApplicable
    });

    const decision = await engine.evaluate(readRequest, [
      lowPriorityDeny,
      highestPriorityNonMatch,
      mediumPriorityPermit
    ]);

    expect(decision.decision).toBe(Decision.Permit);
    expect(decision.matchedPolicies.map(policy => policy.id)).toEqual([
      'medium-priority-permit',
      'low-priority-deny'
    ]);
  });

  it('uses explicit priority sorting when enabled for non-first-applicable algorithms', async () => {
    const lowerPriorityPermit = PolicyBuilder.create('lower-priority-permit')
      .version('1.0.0')
      .permit()
      .priority(100)
      .condition(ConditionBuilder.equals(AttributeRef.action('id'), 'read'))
      .build();

    const higherPriorityPermit = PolicyBuilder.create('higher-priority-permit')
      .version('1.0.0')
      .permit()
      .priority(9000)
      .condition(ConditionBuilder.equals(AttributeRef.action('id'), 'read'))
      .build();

    const engine = new ABACEngine({
      combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
      sortPoliciesByPriority: true
    });

    const decision = await engine.evaluate(readRequest, [
      lowerPriorityPermit,
      higherPriorityPermit
    ]);

    expect(decision.decision).toBe(Decision.Permit);
    expect(decision.matchedPolicies.map(policy => policy.id)).toEqual([
      'higher-priority-permit',
      'lower-priority-permit'
    ]);
  });

  it('preserves falsy right-hand comparison values', async () => {
    const policy = PolicyBuilder.create('falsy-comparison-values')
      .version('1.0.0')
      .permit()
      .condition(
        ConditionBuilder.equals(AttributeRef.subject('active'), false)
          .and(ConditionBuilder.equals(AttributeRef.resource('attempts'), 0))
          .and(ConditionBuilder.equals(AttributeRef.action('dryRun'), false))
          .and(ConditionBuilder.equals(AttributeRef.subject('emptyCode'), ''))
      )
      .build();

    const engine = new ABACEngine({
      combiningAlgorithm: CombiningAlgorithm.DenyOverrides
    });

    const decision = await engine.evaluate(readRequest, [policy]);

    expect(decision.decision).toBe(Decision.Permit);
    expect(decision.matchedPolicies.map(policy => policy.id)).toEqual(['falsy-comparison-values']);
  });

  it('does not reuse stale decisions when reserved cache config is enabled', async () => {
    const policy = PolicyBuilder.create('approved-subject-only')
      .version('1.0.0')
      .permit()
      .condition(ConditionBuilder.equals(AttributeRef.subject('approved'), true))
      .build();

    const engine = new ABACEngine({
      combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
      cacheResults: true,
      cacheTTL: 60
    });

    const permittedRequest: ABACRequest = {
      ...readRequest,
      subject: {
        id: 'cache-user',
        attributes: {
          approved: true
        }
      }
    };
    const rejectedRequest: ABACRequest = {
      ...permittedRequest,
      subject: {
        id: 'cache-user',
        attributes: {
          approved: false
        }
      }
    };

    await expect(engine.evaluate(permittedRequest, [policy])).resolves.toMatchObject({
      decision: Decision.Permit
    });
    await expect(engine.evaluate(rejectedRequest, [policy])).resolves.toMatchObject({
      decision: Decision.NotApplicable
    });
  });

  it('keeps missing attributes NotApplicable unless explicitly checked with not_exists', async () => {
    const missingDepartmentPolicy = PolicyBuilder.create('missing-department-policy')
      .version('1.0.0')
      .permit()
      .condition(ConditionBuilder.equals(AttributeRef.subject('missing'), 'legal'))
      .build();
    const missingAttributeGuard: ABACPolicy = {
      id: 'missing-attribute-guard',
      version: '1.0.0',
      effect: Effect.Permit,
      condition: {
        operator: ComparisonOperator.NotExists,
        left: AttributeRef.subject('missing'),
        right: true
      }
    };

    const engine = new ABACEngine({
      combiningAlgorithm: CombiningAlgorithm.FirstApplicable
    });

    const decision = await engine.evaluate(readRequest, [
      missingDepartmentPolicy,
      missingAttributeGuard
    ]);

    expect(decision.decision).toBe(Decision.Permit);
    expect(decision.matchedPolicies.map(policy => policy.id)).toEqual(['missing-attribute-guard']);
  });

  it('returns Indeterminate when a function condition throws', async () => {
    const policy = PolicyBuilder.create('throwing-function-policy')
      .version('1.0.0')
      .permit()
      .condition(ConditionBuilder.function('throwsDuringEvaluation'))
      .build();

    const engine = new ABACEngine({
      combiningAlgorithm: CombiningAlgorithm.DenyOverrides
    });
    engine.registerFunction('throwsDuringEvaluation', () => {
      throw new Error('boom');
    });

    const decision = await engine.evaluate(readRequest, [policy]);

    expect(decision.decision).toBe(Decision.Indeterminate);
    expect(decision.evaluationDetails?.errors?.[0]).toContain('Policy evaluation error');
    expect(decision.matchedPolicies).toEqual([]);
  });
});
