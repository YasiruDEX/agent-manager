// Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package controllers

import (
	"testing"

	"github.com/wso2/agent-manager/agent-manager-service/spec"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

func TestCreationMethodFor(t *testing.T) {
	tests := []struct {
		name         string
		provisioning spec.Provisioning
		want         string
	}{
		{
			name:         "external provisioning is external regardless of agent kind",
			provisioning: spec.Provisioning{Type: string(utils.ExternalAgent), AgentKind: &spec.ProvisioningAgentKind{Name: "some-kind", Version: "1.0.0"}},
			want:         "external",
		},
		{
			name:         "internal provisioning from an agent kind is from-kind",
			provisioning: spec.Provisioning{Type: string(utils.InternalAgent), AgentKind: &spec.ProvisioningAgentKind{Name: "citizen-inquiry", Version: "2.1.0"}},
			want:         "from-kind",
		},
		{
			name:         "internal provisioning with no agent kind is platform-hosted",
			provisioning: spec.Provisioning{Type: string(utils.InternalAgent)},
			want:         "platform-hosted",
		},
		{
			name:         "external provisioning is external even with the internal-shaped zero value elsewhere",
			provisioning: spec.Provisioning{Type: string(utils.ExternalAgent)},
			want:         "external",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := creationMethodFor(tt.provisioning); got != tt.want {
				t.Errorf("creationMethodFor(%+v) = %q, want %q", tt.provisioning, got, tt.want)
			}
		})
	}
}
